import { createConnection } from "mysql2/promise";

export function databaseConfiguration() {
  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  if (required.some((key) => !process.env[key])) throw new Error("Database configuration is incomplete.");
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(process.env.DB_NAME)) throw new Error("Invalid database identifier.");
  return {
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    socketPath: process.env.DB_SOCKET || undefined,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    supportBigNumbers: true, bigNumberStrings: true, timezone: "Z",
  };
}

export async function connectOperatorDatabase() {
  return createConnection(databaseConfiguration());
}

export function safeDatabaseError(error) {
  return error && typeof error === "object" && typeof error.code === "string" && /^ER_[A-Z0-9_]{1,60}$/.test(error.code)
    ? error.code : "OPERATION_FAILED";
}
