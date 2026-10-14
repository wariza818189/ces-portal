// Demo-only operator fixture. No product account lifecycle or provisioning audit.
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";
import { canonicalUsername, validName, validPassword } from "../lib/auth/policy.mjs";
import { hashPassword } from "../lib/auth/passwords.mjs";
import { hiddenPassword } from "./bootstrap-admin.mjs";
import { connectOperatorDatabase, safeDatabaseError } from "./lib/database.mjs";

const tables = ["users", "staff_sessions", "auth_rate_limits", "audit_logs", "goods_donations", "cash_donations", "activities", "volunteers", "notices"];
export async function seedMidtermStaff(connection, name, usernameInput, password) {
  const [[selected]] = await connection.execute("SELECT DATABASE() AS db_name");
  if (selected?.db_name !== "ces_portal_midterm_demo") throw new Error("The exact midterm demo database is required.");
  const [migration] = await connection.execute("SELECT status, completed_statements FROM schema_migrations WHERE version = ?", ["003_midterm_notices.sql"]);
  if (migration.length !== 1 || migration[0].status !== "APPLIED" || migration[0].completed_statements !== 2) throw new Error("Applied midterm migration is required.");
  const [present] = await connection.execute("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'");
  if (!tables.every(name => present.some(table => table.name === name))) throw new Error("Required application tables are missing.");
  const username = canonicalUsername(usernameInput);
  if (!validName(name) || !username || !validPassword(password)) throw new Error("Invalid synthetic STAFF input.");
  const hash = await hashPassword(password);
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute("SELECT id FROM users WHERE username = ? LIMIT 1 FOR UPDATE", [username]);
    if (existing.length) throw new Error("Username already exists; replacement is refused.");
    const [result] = await connection.execute("INSERT INTO users (name, username, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, 'STAFF', 1, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))", [name.trim(), username, hash]);
    if (result.affectedRows !== 1) throw new Error("Unexpected STAFF insertion result.");
    const [rows] = await connection.execute("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
    if (rows.length !== 1 || typeof rows[0].id !== "string" || !/^[1-9][0-9]{0,19}$/.test(rows[0].id) || BigInt(rows[0].id) > BigInt("18446744073709551615")) throw new Error("Unable to verify created STAFF identity.");
    await connection.commit();
    return rows[0].id;
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  }
}

async function main() {
  if (process.argv.length !== 2 || !process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Use an interactive terminal with no command arguments.");
  const prompts = createInterface({ input: process.stdin, output: process.stdout });
  let name, username;
  try {
    name = await prompts.question("Synthetic STAFF display name: ");
    username = await prompts.question("STAFF username (1–64 ASCII letters/digits/._-): ");
  } finally { prompts.close(); }
  const password = await hiddenPassword("Password (12–128 characters; input hidden): ");
  const confirmation = await hiddenPassword("Confirm password (input hidden): ");
  if (password !== confirmation || !validName(name) || !canonicalUsername(username) || !validPassword(password)) throw new Error("Invalid synthetic STAFF input.");
  const connection = await connectOperatorDatabase();
  try {
    await seedMidtermStaff(connection, name, username, password);
    console.log("Synthetic active STAFF fixture created. Demo-only operator provisioning; no provisioning audit event.");
  } finally { await connection.end(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(`STAFF fixture not confirmed (${safeDatabaseError(error)}). Verify the exact demo target, migration readiness, input and username; inspect before retrying. No credentials were printed.`);
    process.exitCode = 1;
  });
}
