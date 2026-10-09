// Shared by server authentication and the operator bootstrap command.
export const AUTH_POLICY = Object.freeze({
  cookieName: "ces_staff_session",
  sessionSeconds: 8 * 60 * 60,
  maxFailures: 5,
  windowMinutes: 15,
  minPasswordCharacters: 12,
  maxPasswordCharacters: 128,
});

/** @param {unknown} value */
export function canonicalUsername(value) {
  if (typeof value !== "string" || value.length > 256) return null;
  // ASCII identifiers only: trim outer whitespace, lowercase A-Z, preserve
  // punctuation. ascii_bin uniqueness matches this exact canonical value.
  const trimmed = value.trim();
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(trimmed) ? trimmed.toLowerCase() : null;
}

/** @param {unknown} value */
export function validPassword(value) {
  if (typeof value !== "string" || value.length > 256) return false;
  const length = Array.from(value).length;
  return length >= AUTH_POLICY.minPasswordCharacters && length <= AUTH_POLICY.maxPasswordCharacters;
}

/** @param {unknown} value */
export function validName(value) {
  return typeof value === "string" && value.trim().length > 0
    && Array.from(value.trim()).length <= 100 && !/\p{Cc}/u.test(value);
}

/** @param {unknown} role */
export function isStaffRole(role) {
  return role === "ADMIN" || role === "STAFF";
}

/** @param {unknown} value */
export function safeReturnPath(value) {
  // Staff destinations are explicitly allowlisted. An explicit allowlist avoids URL parser,
  // encoded separator, backslash, and protocol-relative redirect ambiguities.
  return typeof value === "string" && ["/dashboard", "/donations/new", "/inventory", "/activities", "/volunteers", "/volunteers/poster"].includes(value)
    ? value : "/dashboard";
}
