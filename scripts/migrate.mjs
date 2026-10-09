import { connectOperatorDatabase, safeDatabaseError } from "./lib/database.mjs";
import { applyMigrations, MigrationError } from "./lib/migrations.mjs";

// Requiring the target explicitly prevents an npm script from silently migrating
// whichever database happens to be configured in the operator environment.
if (process.argv.length !== 4 || process.argv[2] !== "--database" || process.argv[3] !== process.env.DB_NAME) {
  console.error("Usage: node scripts/migrate.mjs --database <exact DB_NAME>. Confirm backup and target before running.");
  process.exitCode = 1;
} else {
  let connection;
  try {
    connection = await connectOperatorDatabase();
    const versions = await applyMigrations(connection);
    console.log(`Migrations verified: ${versions.join(", ")}.`);
  } catch (error) {
    // Never print driver messages: these may contain credentials or SQL values.
    console.error(`Migration failed (${error instanceof MigrationError ? error.message : safeDatabaseError(error)}). DDL may already be committed; inspect checkpoints before resuming the unchanged migration.`);
    process.exitCode = 1;
  } finally {
    await connection?.end();
  }
}
