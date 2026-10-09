import "server-only";
import { createPool, type Pool } from "mysql2/promise";

const requiredEnvironmentVariables = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
] as const;

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

const globalForDb = globalThis as typeof globalThis & {
  mysqlPool?: Pool;
};

export const db =
  globalForDb.mysqlPool ??
  createPool({
    host: process.env.DB_HOST,
    socketPath: process.env.DB_SOCKET || undefined,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    decimalNumbers: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = db;
}
