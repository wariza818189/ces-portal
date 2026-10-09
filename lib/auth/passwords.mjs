import * as argon2 from "argon2";

// OWASP Argon2id baseline. The same cost applies to real, dummy, bootstrap,
// and test hashes; tests never substitute a weaker configuration.
export const PASSWORD_HASH_OPTIONS = Object.freeze({
  type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1, hashLength: 32,
});

/** @param {string} password */
export function hashPassword(password) {
  return argon2.hash(password, PASSWORD_HASH_OPTIONS);
}

/** @param {string} hash @param {string} password */
export async function verifyPassword(hash, password) {
  if (!hash.startsWith("$argon2id$")) throw new Error("Unsupported password hash.");
  return argon2.verify(hash, password);
}

// A fixed non-account hash, generated once with the identical parameters.
// It is public timing padding, not a credential or bootstrap password.
export const DUMMY_PASSWORD_HASH = "$argon2id$v=19$m=19456,p=1,t=2$1m5MqpSwr3TpMnGVuiZ0Ug$CrV2JNiA5sta3ByT49R6VyTbdzeSFZvwx/OfTD1nF68";
