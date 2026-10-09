import { readFile } from "node:fs/promises";
import { connectOperatorDatabase, safeDatabaseError } from "../../scripts/lib/database.mjs";

// Operator creates a new disposable schema and grants first. Never reset an
// existing schema: this fixture loader refuses any pre-existing table.
async function main() {
  const database = process.env.DB_NAME;
  if (process.argv.length !== 2 || process.env.CES_R1_TEST_DATABASE !== database || !/^ces_r1_test_[a-z0-9_]+$/.test(database ?? "")) throw new Error("Explicit disposable test database required.");
  const connection = await connectOperatorDatabase();
  try {
    const [tables] = await connection.execute("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?", [database]);
    if (tables.length) throw new Error("Fixture target must be empty; create a new disposable schema.");
    const sql = await readFile(new URL("./legacy-schema.sql", import.meta.url), "utf8");
    for (const statement of sql.split(";").map(part => part.trim()).filter(Boolean)) await connection.query(statement);
    await connection.execute("INSERT INTO goods_donations (category,quantity,unit,expiry_date,date_received) VALUES ('Rice', '1.25', 'kg', '2026-12-01', '2026-10-01')");
    await connection.execute("INSERT INTO cash_donations (amount,date_received,notes) VALUES ('125.25', '2026-10-01', 'Synthetic historical note')");
    await connection.execute("INSERT INTO volunteers (full_name,course_year,contact_number,activity) VALUES ('Synthetic Legacy Volunteer','Test 1','00000000000','Historical free text')");
    console.log("Disposable legacy fixture prepared. Run test:r1 with the same explicit test database configuration.");
  } finally { await connection.end(); }
}
main().catch(error => { console.error(`Test fixture not completed (${safeDatabaseError(error)}). Requires an explicitly selected, empty disposable schema; never reset an existing target.`); process.exitCode = 1; });
