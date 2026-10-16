import { isIP } from "node:net";

/**
 * Shared by the server runtime and Node operator scripts. Uses Node's trusted CAs.
 * @param {NodeJS.ProcessEnv} environment
 * @returns {import("mysql2").SslOptions | undefined}
 */
export function databaseTlsConfiguration(environment = process.env) {
  if (environment.DB_SSL_MODE === undefined) return undefined;
  if (environment.DB_SSL_MODE !== "VERIFY_IDENTITY") {
    throw new Error("Invalid DB_SSL_MODE: unset it or use VERIFY_IDENTITY.");
  }
  if (environment.DB_SOCKET) {
    throw new Error("DB_SSL_MODE=VERIFY_IDENTITY cannot be used with DB_SOCKET.");
  }
  // mysql2 omits the TLS servername for IP literals. Require a hostname so its
  // verifyIdentity option checks the configured DB_HOST against the certificate.
  if (!environment.DB_HOST || isIP(environment.DB_HOST)) {
    throw new Error("DB_SSL_MODE=VERIFY_IDENTITY requires a DNS hostname in DB_HOST.");
  }
  return { rejectUnauthorized: true, verifyIdentity: true };
}
