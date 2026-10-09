import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import { canonicalUsername, validName, validPassword } from "../lib/auth/policy.mjs";
import { hashPassword } from "../lib/auth/passwords.mjs";
import { writeAudit } from "../lib/auth/audit.mjs";
import { connectOperatorDatabase, safeDatabaseError } from "./lib/database.mjs";

export async function bootstrapAdmin(connection, name, usernameInput, password) {
  const username = canonicalUsername(usernameInput);
  if (!validName(name) || !username || !validPassword(password)) throw new Error("Invalid bootstrap input.");
  const [[{ db_name: database }]] = await connection.query("SELECT DATABASE() AS db_name");
  const lock = `ces:bootstrap:${createHash("sha256").update(database).digest("hex").slice(0, 40)}`;
  const [[{ acquired }]] = await connection.execute("SELECT GET_LOCK(?, 0) AS acquired", [lock]);
  if (Number(acquired) !== 1) throw new Error("Bootstrap is already running.");
  try {
    await connection.beginTransaction();
    const [admins] = await connection.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1 FOR UPDATE");
    if (admins.length) throw new Error("An Admin already exists.");
    const hash = await hashPassword(password);
    await connection.execute(
      "INSERT INTO users (name, username, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, 'ADMIN', 1, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))",
      [name.trim(), username, hash],
    );
    const [[{ id }]] = await connection.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
    await writeAudit(connection, "ADMIN_BOOTSTRAPPED", null, id);
    await connection.commit();
    return id;
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    await connection.execute("SELECT RELEASE_LOCK(?)", [lock]);
  }
}

export function hiddenPassword(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Bootstrap requires an interactive terminal.");
  process.stdout.write(prompt);
  const previousRaw = process.stdin.isRaw;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let input = "";
    let overLimit = false;
    const decoder = new StringDecoder("utf8");
    function finish(error) {
      process.stdin.off("data", receive);
      process.stdin.setRawMode(previousRaw);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error); else resolve(overLimit ? "" : input);
    }
    function receive(chunk) {
      for (const character of decoder.write(chunk)) {
        if (character === "\u0003" || character === "\u0004") { finish(new Error("Bootstrap cancelled.")); return; }
        if (character === "\r" || character === "\n") { finish(); return; }
        if (character === "\u007f" || character === "\b") input = Array.from(input).slice(0, -1).join("");
        else if (input.length < 256) input += character;
        else overLimit = true; // Reject oversized input; never accept truncation.
      }
    }
    process.stdin.on("data", receive);
  });
}

async function main() {
  if (process.argv.length !== 2 || !process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Use an interactive terminal, with no command arguments.");
  }
  const prompts = createInterface({ input: process.stdin, output: process.stdout });
  let name, username;
  try {
    name = await prompts.question("Admin name: ");
    username = await prompts.question("Admin username (1–64 ASCII letters/digits/._-): ");
  } finally { prompts.close(); }
  const password = await hiddenPassword("Password (12–128 characters; input hidden): ");
  const confirmation = await hiddenPassword("Confirm password (input hidden): ");
  if (password !== confirmation || !validName(name) || !canonicalUsername(username) || !validPassword(password)) {
    throw new Error("Invalid bootstrap input.");
  }
  const connection = await connectOperatorDatabase();
  try {
    await bootstrapAdmin(connection, name, username, password);
    console.log("Initial Admin created and audited.");
  } finally { await connection.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Admin bootstrap not completed (${safeDatabaseError(error)}). Verify input, migration state, and whether an Admin already exists; no credentials were printed.`);
    process.exitCode = 1;
  });
}
