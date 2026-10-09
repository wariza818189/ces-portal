import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export class MigrationError extends Error {}

const R1_EVENTS = "'AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILURE', 'AUTH_LOGOUT', 'GOODS_DONATION_CREATED', 'CASH_DONATION_CREATED', 'ADMIN_BOOTSTRAPPED'";
const R2_EVENTS = `${R1_EVENTS}, 'ACTIVITY_CREATED', 'ACTIVITY_UPDATED', 'ACTIVITY_STATUS_CHANGED'`;
const auditCheck = events => `event_type IN (${events})`;
export const AUDIT_CHECK_REPLACEMENT = `ALTER TABLE audit_logs DROP CHECK chk_audit_event, ADD CONSTRAINT chk_audit_event CHECK (${auditCheck(R2_EVENTS)})`;
const compactSql = sql => sql.replace(/\s+/g, " ").trim();
const isAuditReplacement = sql => compactSql(sql) === AUDIT_CHECK_REPLACEMENT;
const normalizeCheck = value => value.replace(/\\'/g, "'").split(/('(?:[^']|'')*')/).map((part, index) => index % 2
  ? part : part.toLowerCase().replace(/_(?:ascii|utf8mb4)/g, "").replace(/[`\s()]/g, "")).join("");

async function auditCheckState(connection, database) {
  const [rows] = await connection.execute(
    "SELECT t.ENFORCED, c.CHECK_CLAUSE FROM information_schema.TABLE_CONSTRAINTS t JOIN information_schema.CHECK_CONSTRAINTS c ON c.CONSTRAINT_SCHEMA = t.CONSTRAINT_SCHEMA AND c.CONSTRAINT_NAME = t.CONSTRAINT_NAME WHERE t.TABLE_SCHEMA = ? AND t.TABLE_NAME = 'audit_logs' AND t.CONSTRAINT_NAME = 'chk_audit_event' AND t.CONSTRAINT_TYPE = 'CHECK'", [database]);
  if (rows.length !== 1 || rows[0].ENFORCED !== "YES") throw new MigrationError("Audit event CHECK is missing or unenforced.");
  for (const [state, events] of [["R1", R1_EVENTS], ["R2", R2_EVENTS]]) {
    if (normalizeCheck(rows[0].CHECK_CLAUSE) === normalizeCheck(auditCheck(events))) return state;
  }
  throw new MigrationError("Audit event CHECK differs from approved migration chain.");
}

export const MIGRATION_TABLE_SQL = `CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status VARCHAR(10) NOT NULL,
  completed_statements INT UNSIGNED NOT NULL DEFAULT 0,
  started_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
  applied_at DATETIME(3) NULL,
  CONSTRAINT chk_migration_status CHECK (status IN ('APPLYING', 'APPLIED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

// This runner intentionally accepts simple additive CREATE/ALTER statements,
// not procedures, delimiters, destructive migrations, or SQL containing ';'
// inside literals. Extend the parser only with a separately reviewed need.
export function migrationStatements(sql) {
  const statements = sql.replace(/^\s*--.*$/gm, "").split(";").map((part) => part.trim()).filter(Boolean);
  if (!statements.length || statements.some((sql) => !/^(CREATE TABLE IF NOT EXISTS|ALTER TABLE) /i.test(sql)
    || (!isAuditReplacement(sql) && /\b(DROP|TRUNCATE|DELETE|UPDATE|REPLACE)\b/i.test(sql.replace(/ON (?:UPDATE|DELETE) RESTRICT/gi, ""))))) {
    throw new MigrationError("Migration contains unsupported SQL.");
  }
  return statements;
}

async function alreadyAppliedAlter(connection, database, statement, chain = {}) {
  if (isAuditReplacement(statement)) {
    if (!chain.successor) throw new MigrationError("Audit CHECK replacement requires the approved successor migration.");
    return (await auditCheckState(connection, database)) === "R2";
  }
  const column = /^ALTER TABLE (\w+) ADD COLUMN (\w+) BIGINT UNSIGNED NULL$/i.exec(statement);
  if (column) {
    const [rows] = await connection.execute(
      "SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
      [database, column[1], column[2]],
    );
    if (!rows.length) return false;
    if (rows.length !== 1 || rows[0].COLUMN_TYPE !== "bigint unsigned" || rows[0].IS_NULLABLE !== "YES" || rows[0].COLUMN_DEFAULT !== null || rows[0].EXTRA) throw new MigrationError("Existing actor column differs from migration.");
    return true;
  }
  const index = /^ALTER TABLE (\w+) ADD INDEX (\w+) \((\w+)\)$/i.exec(statement);
  if (index) {
    const [rows] = await connection.execute(
      "SELECT COLUMN_NAME, NON_UNIQUE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ? ORDER BY SEQ_IN_INDEX",
      [database, index[1], index[2]],
    );
    if (!rows.length) return false;
    if (rows.length !== 1 || rows[0].COLUMN_NAME !== index[3] || rows[0].NON_UNIQUE !== 1) throw new MigrationError("Existing index differs from migration.");
    return true;
  }
  const foreignKey = /^ALTER TABLE (\w+) ADD CONSTRAINT (\w+) FOREIGN KEY \((\w+)\) REFERENCES (\w+)\((\w+)\) ON DELETE RESTRICT ON UPDATE RESTRICT$/i.exec(statement);
  if (foreignKey) {
    const [rows] = await connection.execute(
      `SELECT k.COLUMN_NAME, k.REFERENCED_TABLE_SCHEMA, k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME, r.DELETE_RULE, r.UPDATE_RULE
       FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r
       ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.TABLE_NAME = k.TABLE_NAME AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
       WHERE k.CONSTRAINT_SCHEMA = ? AND k.TABLE_NAME = ? AND k.CONSTRAINT_NAME = ?`, [database, foreignKey[1], foreignKey[2]],
    );
    if (!rows.length) return false;
    const row = rows[0];
    if (rows.length !== 1 || row.COLUMN_NAME !== foreignKey[3] || row.REFERENCED_TABLE_SCHEMA !== database
      || row.REFERENCED_TABLE_NAME !== foreignKey[4] || row.REFERENCED_COLUMN_NAME !== foreignKey[5]
      || row.DELETE_RULE !== "RESTRICT" || row.UPDATE_RULE !== "RESTRICT") throw new MigrationError("Existing foreign key differs from migration.");
    return true;
  }
  if (/^ALTER TABLE /i.test(statement)) throw new MigrationError("Unsupported additive ALTER convention.");
  return false;
}

async function verifyFoundation(connection, database) {
  // Existing installations must use the accepted InnoDB business tables. Never
  // alter engines or create substitutes for a missing accepted schema.
  const [tables] = await connection.execute(
    "SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('goods_donations', 'cash_donations', 'volunteers')", [database],
  );
  if (tables.length !== 3 || tables.some((row) => row.ENGINE !== "InnoDB")) throw new MigrationError("Apply/verify the accepted business schema before migration.");
  const [ids] = await connection.execute(
    "SELECT TABLE_NAME, COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = 'id' AND TABLE_NAME IN ('goods_donations', 'cash_donations', 'volunteers')", [database],
  );
  if (ids.length !== 3 || ids.some((row) => row.COLUMN_TYPE !== "bigint unsigned")) throw new MigrationError("Business primary key types differ from the accepted schema.");
}

// CREATE IF NOT EXISTS must not silently accept a different pre-existing auth
// table. Compare the supplied simple schema's columns, keys, checks and FKs.
async function verifyExistingCreate(connection, database, statement, chain = {}) {
  const match = /^CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*)\) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4$/i.exec(statement);
  if (!match) throw new MigrationError("Unsupported CREATE convention.");
  const [, table, definition] = match;
  const [tables] = await connection.execute("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", [database, table]);
  if (!tables.length) return false;
  if (tables.length !== 1 || tables[0].ENGINE !== "InnoDB") throw new MigrationError(`Existing table differs from migration: ${table}`);
  const lines = definition.split("\n").map(line => line.trim().replace(/,$/, "")).filter(Boolean);
  const [columns] = await connection.execute("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLLATION_NAME, EXTRA, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION", [database, table]);
  const expected = lines.filter(line => !/^(CONSTRAINT|(?:UNIQUE )?INDEX) /i.test(line));
  if (columns.length !== expected.length) throw new MigrationError(`Existing columns differ from migration: ${table}`);
  for (let index = 0; index < expected.length; index++) {
    const field = /^(\w+) (BIGINT UNSIGNED|INT UNSIGNED|TINYINT UNSIGNED|BOOLEAN|VARCHAR\(\d+\)|CHAR\(\d+\)|BINARY\(\d+\)|DATETIME\(3\)|DATE|DECIMAL\(\d+,\d+\)|JSON)(.*)$/i.exec(expected[index]);
    if (!field) throw new MigrationError("Unsupported column convention.");
    const defaultMatch = / DEFAULT (\(UTC_TIMESTAMP\(3\)\)|'[^']*'|TRUE|FALSE|\d+)/i.exec(field[3]);
    const expectedDefault = defaultMatch ? defaultMatch[1].replace(/^'|'$/g, "").replace(/^TRUE$/i, "1").replace(/^FALSE$/i, "0") : null;
    const normalizeDefault = value => value === null ? null : /^\(?utc_timestamp\(3\)\)?$/i.test(String(value)) ? "utc_timestamp3" : String(value);
    const column = columns[index];
    if (normalizeDefault(column.COLUMN_DEFAULT) !== normalizeDefault(expectedDefault)
      || column.EXTRA.includes("on update")) throw new MigrationError(`Existing default differs from migration: ${table}.${field[1]}`);
    const type = field[2].toLowerCase().replace("boolean", "tinyint(1)");
    if (column.COLUMN_NAME !== field[1] || column.COLUMN_TYPE !== type
      || column.IS_NULLABLE !== (/NOT NULL|PRIMARY KEY/i.test(field[3]) ? "NO" : "YES")
      || (/COLLATE ascii_bin/i.test(field[3]) && column.COLLATION_NAME !== "ascii_bin")
      || (/AUTO_INCREMENT/i.test(field[3]) !== column.EXTRA.includes("auto_increment"))) throw new MigrationError(`Existing column differs from migration: ${table}.${field[1]}`);
  }
  const [indexes] = await connection.execute("SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY SEQ_IN_INDEX", [database, table]);
  const primary = expected.find(line => /PRIMARY KEY/i.test(line))?.split(" ")[0];
  const keys = [...(primary ? [["PRIMARY", primary, 0]] : []), ...lines.flatMap(line => {
    const key = /^(UNIQUE )?INDEX (\w+) \(([\w, ]+)\)$/i.exec(line);
    return key ? [[key[2], key[3].replaceAll(" ", ""), key[1] ? 0 : 1]] : [];
  })];
  for (const [name, fields, nonUnique] of keys) {
    const actual = indexes.filter(row => row.INDEX_NAME === name);
    if (actual.map(row => row.COLUMN_NAME).join(",") !== fields || actual.some(row => row.NON_UNIQUE !== nonUnique)) throw new MigrationError(`Existing key differs from migration: ${table}.${name}`);
  }
  const [checks] = await connection.execute("SELECT t.CONSTRAINT_NAME, t.ENFORCED, c.CHECK_CLAUSE FROM information_schema.TABLE_CONSTRAINTS t JOIN information_schema.CHECK_CONSTRAINTS c ON c.CONSTRAINT_SCHEMA = t.CONSTRAINT_SCHEMA AND c.CONSTRAINT_NAME = t.CONSTRAINT_NAME WHERE t.TABLE_SCHEMA = ? AND t.TABLE_NAME = ? AND t.CONSTRAINT_TYPE = 'CHECK'", [database, table]);
  for (const line of lines) {
    const check = /^CONSTRAINT (\w+) CHECK \((.*)\)$/i.exec(line);
    if (check && table === "audit_logs" && check[1] === "chk_audit_event" && chain.successor) {
      const state = await auditCheckState(connection, database);
      if (chain.requireSuccessor && state !== "R2") throw new MigrationError("Applied successor audit CHECK is missing.");
      continue;
    }
    if (check && !checks.some(row => row.CONSTRAINT_NAME === check[1] && row.ENFORCED === "YES" && normalizeCheck(row.CHECK_CLAUSE) === normalizeCheck(check[2]))) throw new MigrationError(`Existing check differs from migration: ${table}.${check[1]}`);
    if (/^CONSTRAINT \w+ FOREIGN KEY /i.test(line)
      && !(await alreadyAppliedAlter(connection, database, `ALTER TABLE ${table} ADD ${line}`))) throw new MigrationError(`Existing foreign key missing: ${table}`);
  }
  return true;
}

export async function applyMigrations(connection, directory = fileURLToPath(new URL("../../database/migrations/", import.meta.url))) {
  const [[{ db_name: database }]] = await connection.query("SELECT DATABASE() AS db_name");
  if (!database) throw new MigrationError("No target database selected.");
  const lock = `ces:migrations:${createHash("sha256").update(database).digest("hex").slice(0, 40)}`;
  const [[{ acquired }]] = await connection.execute("SELECT GET_LOCK(?, 0) AS acquired", [lock]);
  if (Number(acquired) !== 1) throw new MigrationError("Another migration runner holds the lock.");
  try {
    await verifyFoundation(connection, database);
    if (!(await verifyExistingCreate(connection, database, MIGRATION_TABLE_SQL))) await connection.query(MIGRATION_TABLE_SQL);
    const files = (await readdir(directory)).filter((file) => /^\d{3}_[a-z0-9_]+\.sql$/.test(file)).sort();
    if (new Set(files.map((file) => file.slice(0, 3))).size !== files.length) throw new MigrationError("Duplicate migration number.");
    const [recorded] = await connection.query("SELECT version FROM schema_migrations ORDER BY version");
    if (recorded.some((row) => !files.includes(row.version))) throw new MigrationError("An applied migration file is missing.");
    const migrations = [];
    for (const version of files) {
      const sql = await readFile(`${directory}/${version}`, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const statements = migrationStatements(sql);
      const [rows] = await connection.execute("SELECT checksum, status, completed_statements FROM schema_migrations WHERE version = ?", [version]);
      if (rows.length && rows[0].checksum !== checksum) throw new MigrationError(`Migration checksum mismatch: ${version}`);
      if (rows.length && (!['APPLYING', 'APPLIED'].includes(rows[0].status)
        || rows[0].completed_statements > statements.length
        || (rows[0].status === 'APPLIED' && rows[0].completed_statements !== statements.length))) throw new MigrationError("Invalid migration checkpoint.");
      migrations.push({ version, checksum, statements, rows });
    }
    const predecessor = migrations.find(item => item.version === "001_auth_foundation.sql");
    const successor = migrations.find(item => item.version === "002_activity_management.sql");
    // Only this historical constraint may be superseded, by this exact reviewed chain.
    const chain = { successor: false, requireSuccessor: successor?.rows[0]?.status === "APPLIED" };
    if (successor) {
      if (predecessor?.checksum !== "7c018fd31fabb353545a9dd04cea3bfd4327e88ddab488764fecb2acdfa85d3d"
        || successor.checksum !== "e2704724d5bae39b2027bf50889001a198fa1d0051023f03b600f89e277b8a81"
        || successor.statements.length !== 5 || !isAuditReplacement(successor.statements[4])) throw new MigrationError("Unrecognized audit CHECK successor chain.");
      chain.successor = true;
    }
    for (const item of migrations) {
      const { version, checksum, statements, rows } = item;
      const verificationChain = version === "001_auth_foundation.sql" ? chain : {};
      // Validate pre-existing CREATE definitions even on a completed rerun.
      for (const statement of statements.filter(sql => /^CREATE /i.test(sql))) {
        const exists = await verifyExistingCreate(connection, database, statement, verificationChain);
        if (rows[0]?.status === "APPLIED" && !exists) throw new MigrationError("Applied migration table is missing.");
      }
      if (rows[0]?.status === "APPLIED") {
        for (const statement of statements.filter(sql => /^ALTER /i.test(sql))) {
          if (!(await alreadyAppliedAlter(connection, database, statement, version === "002_activity_management.sql" ? chain : {}))) throw new MigrationError("Applied migration actor schema is missing.");
        }
        continue;
      }
      if (!rows.length) {
        await connection.execute("INSERT INTO schema_migrations (version, checksum, status) VALUES (?, ?, 'APPLYING')", [version, checksum]);
      }
      const completed = rows[0]?.completed_statements ?? 0;
      if (completed > statements.length) throw new MigrationError("Invalid migration checkpoint.");
      for (const statement of statements.slice(0, completed).filter(sql => /^ALTER /i.test(sql))) {
        if (!(await alreadyAppliedAlter(connection, database, statement, version === "002_activity_management.sql" ? chain : {}))) throw new MigrationError("Checkpointed schema is missing.");
      }
      for (let index = completed; index < statements.length; index++) {
        if (/^CREATE /i.test(statements[index])) {
          if (!(await verifyExistingCreate(connection, database, statements[index], verificationChain))) await connection.query(statements[index]);
        } else if (!(await alreadyAppliedAlter(connection, database, statements[index], version === "002_activity_management.sql" ? chain : {}))) await connection.query(statements[index]);
        await connection.execute("UPDATE schema_migrations SET completed_statements = ? WHERE version = ?", [index + 1, version]);
      }
      await connection.execute("UPDATE schema_migrations SET status = 'APPLIED', applied_at = UTC_TIMESTAMP(3) WHERE version = ?", [version]);
    }
    return files;
  } finally {
    await connection.execute("SELECT RELEASE_LOCK(?)", [lock]);
  }
}
