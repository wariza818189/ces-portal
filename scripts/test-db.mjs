import mysql from "mysql2/promise";
import { databaseTlsConfiguration } from "../lib/db-tls.mjs";

const requiredVariables = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  socketPath: process.env.DB_SOCKET || undefined,
  ssl: databaseTlsConfiguration(),
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const [rows] = await connection.query(`
  SELECT
    DATABASE() AS database_name,
    CURRENT_USER() AS database_user,
    (SELECT COUNT(*) FROM goods_donations) AS goods_records,
    (SELECT COUNT(*) FROM cash_donations) AS cash_records,
    (SELECT COUNT(*) FROM volunteers) AS volunteer_records
`);

console.log(rows);

await connection.end();
