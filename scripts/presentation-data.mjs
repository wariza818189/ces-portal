// Preview is database-free. Mutations require separately approved, explicit flags.
import { parseArgs } from "node:util";
import { open, readFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createConnection } from "mysql2/promise";
import { databaseConfiguration, safeDatabaseError } from "./lib/database.mjs";
import { batch, legacyBatch, presentationPlan, checkTarget, applyPresentation, rollbackPresentation, verifyManifest } from "./lib/presentation-data.mjs";

async function saveJournal(path, journal) {
  const temporary = `${path}.next`;
  const file = await open(temporary, "wx", 0o600);
  try { await file.writeFile(JSON.stringify(journal, null, 2) + "\n"); await file.sync(); } finally { await file.close(); }
  await rename(temporary, path);
  const directory = await open(dirname(path), "r");
  try { await directory.sync(); } finally { await directory.close(); }
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: {
    date: { type: "string" }, mode: { type: "string", default: "preview" },
    host: { type: "string" }, port: { type: "string" }, database: { type: "string" },
    actor: { type: "string" }, manifest: { type: "string" }, approve: { type: "string" },
    batch: { type: "string", default: batch },
  } });
  const plan = presentationPlan(values.date, values.batch);
  if (!["preview", "apply", "rollback"].includes(values.mode)) throw new Error("Choose preview, apply or rollback.");
  if (values.mode === "preview") {
    console.log(JSON.stringify({ mode: "preview", databaseConnected: false, plan }, null, 2));
    return;
  }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: process.env.APP_TIME_ZONE || "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (values.mode === "apply" && plan.date > today) throw new Error("Goods receipt dates cannot be in the future in the application time zone.");
  if (values.approve !== `${values.mode}:${plan.batch}` || !values.host || !values.port || !values.database || !values.actor || !values.manifest) throw new Error("Explicit approval, target, ADMIN and journal flags are required.");
  const configuration = databaseConfiguration();
  if (configuration.host !== values.host || String(configuration.port) !== values.port || configuration.database !== values.database) throw new Error("Environment does not match the explicitly approved host, port and database.");
  if (configuration.socketPath && !(values.host === "localhost" && configuration.socketPath.startsWith("/tmp/ces-presentation-mysql-"))) throw new Error("Only the isolated presentation-test socket is supported.");
  if (!configuration.socketPath && process.env.DB_SSL_MODE !== "VERIFY_IDENTITY") throw new Error("Network targets require verified TLS.");
  const target = { host: values.host, port: values.port, database: values.database };
  const path = resolve(values.manifest);
  const lockPath = `${path}.lock`;
  const localLock = await open(lockPath, "wx", 0o600);
  let connection;
  let databaseLock = false;
  // Preserve v1's lock identity so old and revised fixtures cannot run together.
  const lockName = createHash("sha256").update(`${legacyBatch}:${target.database}`).digest("hex");
  try {
    let journal;
    try { journal = JSON.parse(await readFile(path, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
    const planHash = createHash("sha256").update(JSON.stringify(plan)).digest("hex");
    if (journal && (journal.batch !== plan.batch || journal.planHash !== planHash || JSON.stringify(journal.target) !== JSON.stringify(target))) throw new Error("Journal does not match the reviewed batch, date or target.");
    if (journal && !["applied", "rolled_back"].includes(journal.status)) throw new Error("Uncertain journal state: operator reconciliation is required; do not retry with a new journal.");
    if (!journal && values.mode !== "apply") throw new Error("Rollback requires the original applied journal.");
    if (!journal && plan.batch === legacyBatch) throw new Error("The v1 batch is retired; only existing v1 journals can be verified or rolled back.");
    connection = await createConnection({ ...configuration, dateStrings: true });
    const [[lock]] = await connection.execute("SELECT GET_LOCK(?, 0) AS acquired", [lockName]);
    if (String(lock.acquired) !== "1") throw new Error("Another presentation operation is running.");
    databaseLock = true;
    await checkTarget(connection, target);
    if (values.mode === "apply") {
      if (journal?.status === "rolled_back") throw new Error("This batch was rolled back; do not reapply it.");
      if (journal) {
        await connection.beginTransaction();
        try { await verifyManifest(connection, journal); } finally { await connection.rollback(); }
        console.log("Presentation batch already applied and unchanged; zero writes.");
        return;
      }
      journal = { batch: plan.batch, target, planHash, date: plan.date, actor: values.actor, status: "initializing", rows: [] };
      await saveJournal(path, journal);
      await applyPresentation(connection, plan, values.actor, async rows => {
        journal.rows = rows; journal.status = "prepared";
        await saveJournal(path, journal);
      });
      journal.status = "applied";
      await saveJournal(path, journal);
      console.log("Presentation batch applied: 15 synthetic business records. Preserve its private journal for reruns/rollback.");
    } else {
      if (journal.status === "rolled_back") { console.log("Presentation batch already rolled back; zero writes."); return; }
      await rollbackPresentation(connection, journal, values.actor, async () => {
        journal.status = "rollback_prepared"; await saveJournal(path, journal);
      });
      journal.status = "rolled_back";
      await saveJournal(path, journal);
      console.log("Only unchanged manifest records removed; audit history retained. Preserve the journal.");
    }
  } finally {
    if (connection) {
      if (databaseLock) await connection.execute("SELECT RELEASE_LOCK(?)", [lockName]).catch(() => {});
      await connection.end();
    }
    await localLock.close();
    await unlink(lockPath);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(`Presentation operation not confirmed (${safeDatabaseError(error)}). Check flags/target and journal state; preserve the journal and reconcile uncertain commits before retrying. No credentials were printed.`);
    process.exitCode = 1;
  });
}
