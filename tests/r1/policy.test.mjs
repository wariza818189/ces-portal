import test from "node:test";
import assert from "node:assert/strict";
import { AUTH_POLICY, canonicalUsername, validPassword, isStaffRole, safeReturnPath } from "../../lib/auth/policy.mjs";
import { hashPassword, verifyPassword, DUMMY_PASSWORD_HASH } from "../../lib/auth/passwords.mjs";
import { migrationStatements } from "../../scripts/lib/migrations.mjs";
import { tokenDigest } from "@/lib/auth/session";

test("username canonicalization matches ASCII database uniqueness", () => {
  assert.equal(canonicalUsername("  CES.Admin-1_2  "), "ces.admin-1_2");
  for (const value of ["", " ", "a".repeat(65), "a b", "Kelvin", "ábc", "abc\0", "_admin", null]) assert.equal(canonicalUsername(value), null);
  assert.equal(canonicalUsername("A".repeat(64)), "a".repeat(64));
});
test("password character boundaries preserve spaces and Unicode without composition requirements", () => {
  for (const password of ["a".repeat(12), "a".repeat(128), "😀".repeat(128), " ".repeat(12)]) assert.equal(validPassword(password), true);
  for (const password of ["", "a".repeat(11), "a".repeat(129), "😀".repeat(129), null]) assert.equal(validPassword(password), false);
});
test("return paths reject URL, encoding, separator, and protocol tricks", () => {
  for (const path of ["/dashboard", "/donations/new", "/inventory", "/activities", "/volunteers", "/volunteers/poster"]) assert.equal(safeReturnPath(path), path);
  for (const path of ["https://attacker.test", "//attacker.test", "javascript:alert(1)", "data:text/html,x", "/\\attacker.test", "/%2f%2fattacker.test", "/dashboard\r\nLocation:x", "/login", ["/inventory"], null]) assert.equal(safeReturnPath(path), "/dashboard");
});
test("roles and session token formats fail closed", () => {
  assert.equal(isStaffRole("STAFF"), true); assert.equal(isStaffRole("ADMIN"), true);
  for (const role of ["admin", "OWNER", "", null]) assert.equal(isStaffRole(role), false);
  assert.equal(tokenDigest("a".repeat(64)).length, 32);
  for (const token of ["", "a".repeat(63), "g".repeat(64), null]) assert.equal(tokenDigest(token), null);
  assert.equal(AUTH_POLICY.sessionSeconds, 28800);
});
test("Argon2id real and dummy hashes use the approved cost and fresh salts", async () => {
  const password = " Synthetic password ";
  const first = await hashPassword(password), second = await hashPassword(password);
  assert.ok(first !== second, "Fresh password hashes must use different salts.");
  for (const hash of [first, second, DUMMY_PASSWORD_HASH]) assert.ok(hash.startsWith("$argon2id$v=19$") && ["m=19456", "t=2", "p=1"].every(parameter => hash.split("$")[3].split(",").includes(parameter)), "Argon2id cost differs from approved configuration");
  assert.equal(await verifyPassword(first, password), true);
  assert.equal(await verifyPassword(first, password.trim()), false);
  await assert.rejects(() => verifyPassword("$argon2i$invalid", password));
  assert.equal(await verifyPassword(DUMMY_PASSWORD_HASH, password), false);
});
test("migration parser rejects destructive or unsupported SQL", () => {
  for (const sql of ["DROP TABLE users;", "TRUNCATE users;", "DELETE FROM users;", "ALTER TABLE users DROP COLUMN name;"]) assert.throws(() => migrationStatements(sql));
  assert.equal(migrationStatements("-- additive\nCREATE TABLE IF NOT EXISTS test (id INT);\nALTER TABLE test ADD COLUMN recorded_by BIGINT UNSIGNED NULL;").length, 2);
});
