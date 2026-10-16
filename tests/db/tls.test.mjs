import test, { after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { EventEmitter } from "node:events";
import net from "node:net";
import tls from "node:tls";
import { Connection } from "mysql2";
import { databaseTlsConfiguration } from "../../lib/db-tls.mjs";

// Capture both consumers' options without opening any database connection.
const calls = [];
globalThis.__cesTlsTestConnection = (kind, configuration) => {
  calls.push({ kind, configuration });
  return { configuration, query: async () => [[]], end: async () => {} };
};
const mysqlStub = `data:text/javascript,${encodeURIComponent(`
  export const createPool = configuration => globalThis.__cesTlsTestConnection("pool", configuration);
  export const createConnection = async configuration => globalThis.__cesTlsTestConnection("operator", configuration);
  export default { createPool, createConnection };
`)}`;
const runtimeUrl = new URL("../../lib/db.ts", import.meta.url).href;
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "mysql2/promise") return { url: mysqlStub, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    // Re-evaluate runtime configuration per case through the existing TS loader.
    return next(url.startsWith(`${runtimeUrl}?`) ? runtimeUrl : url, context);
  },
});
const { databaseConfiguration, connectOperatorDatabase } = await import("../../scripts/lib/database.mjs");
const environmentKeys = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "DB_SOCKET", "DB_SSL_MODE", "NODE_ENV"];
const originalEnvironment = Object.fromEntries(environmentKeys.map(key => [key, process.env[key]]));
const originalPool = globalThis.mysqlPool;
let sequence = 0;
const runtime = () => import(`${runtimeUrl}?tls-case=${sequence++}`);

beforeEach(() => {
  for (const key of environmentKeys) delete process.env[key];
  Object.assign(process.env, {
    DB_HOST: "synthetic.mysql.database.azure.com", DB_PORT: "3306",
    DB_USER: "synthetic", DB_PASSWORD: "synthetic-only", DB_NAME: "ces_tls_test",
    NODE_ENV: "test",
  });
  delete globalThis.mysqlPool;
  calls.length = 0;
  mock.method(net.Socket.prototype, "connect", () => { throw new Error("Database/network access forbidden in TLS tests."); });
});
afterEach(() => mock.restoreAll());
after(() => {
  hooks.deregister();
  delete globalThis.__cesTlsTestConnection;
  if (originalPool === undefined) delete globalThis.mysqlPool;
  else globalThis.mysqlPool = originalPool;
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("unset TLS mode preserves runtime and operator local TCP options", async () => {
  process.env.DB_HOST = "127.0.0.1";
  const { db } = await runtime();
  const operator = await connectOperatorDatabase();
  assert.equal(databaseTlsConfiguration(), undefined);
  for (const configuration of [db.configuration, operator.configuration]) {
    assert.equal(configuration.host, "127.0.0.1");
    assert.equal(configuration.port, 3306);
    assert.equal(configuration.ssl, undefined);
    assert.equal(configuration.socketPath, undefined);
    assert.equal(configuration.user, "synthetic");
    assert.equal(configuration.password, "synthetic-only");
    assert.equal(configuration.database, "ces_tls_test");
  }
  assert.equal(db.configuration.decimalNumbers, true);
  assert.equal(db.configuration.connectionLimit, 5);
  assert.equal(operator.configuration.bigNumberStrings, true);
  assert.equal(operator.configuration.timezone, "Z");
});

test("VERIFY_IDENTITY reaches runtime pool and operator with both checks enabled", async () => {
  process.env.DB_SSL_MODE = "VERIFY_IDENTITY";
  const { db } = await runtime();
  const operator = await connectOperatorDatabase();
  for (const configuration of [db.configuration, operator.configuration, databaseConfiguration()]) {
    assert.deepEqual(configuration.ssl, { rejectUnauthorized: true, verifyIdentity: true });
    assert.equal(configuration.host, process.env.DB_HOST);
    assert.equal(configuration.socketPath, undefined);
  }
  assert.deepEqual(calls.map(call => call.kind), ["pool", "operator"]);
});

test("invalid modes fail before pool creation or operator connection, even with a cached pool", async () => {
  for (const mode of ["", " ", "VERIFY_IDENTIY", "verify_identity", "VERIFY_IDENTITY ", "REQUIRED", "VERIFY_CA", "DISABLED"]) {
    process.env.DB_SSL_MODE = mode;
    globalThis.mysqlPool = { cached: true };
    assert.throws(() => databaseTlsConfiguration(), /Invalid DB_SSL_MODE/);
    assert.throws(() => databaseConfiguration(), /Invalid DB_SSL_MODE/);
    await assert.rejects(connectOperatorDatabase(), /Invalid DB_SSL_MODE/);
    await assert.rejects(runtime(), /Invalid DB_SSL_MODE/);
  }
  assert.equal(calls.length, 0);
});

test("unset TLS mode preserves isolated R1, R2 and midterm Unix socket paths", async () => {
  for (const suite of ["r1", "r2", "midterm"]) {
    delete globalThis.mysqlPool;
    process.env.DB_SOCKET = `/tmp/ces-${suite}-mysql-Synthetic/mysql.sock`;
    const { db } = await runtime();
    const operator = await connectOperatorDatabase();
    for (const configuration of [db.configuration, operator.configuration]) {
      assert.equal(configuration.socketPath, process.env.DB_SOCKET);
      assert.equal(configuration.ssl, undefined);
    }
  }
});

test("TLS combined with a Unix socket fails instead of downgrading", async () => {
  process.env.DB_SOCKET = "/tmp/ces-r1-mysql-Synthetic/mysql.sock";
  process.env.DB_SSL_MODE = "VERIFY_IDENTITY";
  await assert.rejects(runtime(), /cannot be used with DB_SOCKET/);
  await assert.rejects(connectOperatorDatabase(), /cannot be used with DB_SOCKET/);
  assert.equal(calls.length, 0);
});

test("verified mode requires a DNS hostname so mysql2 cannot omit its TLS identity", async () => {
  process.env.DB_SSL_MODE = "VERIFY_IDENTITY";
  for (const host of ["127.0.0.1", "::1", "2001:db8::1"]) {
    process.env.DB_HOST = host;
    await assert.rejects(runtime(), /requires a DNS hostname/);
    await assert.rejects(connectOperatorDatabase(), /requires a DNS hostname/);
  }
  for (const host of [undefined, ""]) {
    assert.throws(() => databaseTlsConfiguration({ DB_SSL_MODE: "VERIFY_IDENTITY", DB_HOST: host }), /requires a DNS hostname/);
  }
  assert.equal(calls.length, 0);
});

test("connectivity check script also uses verified TLS", async () => {
  process.env.DB_SSL_MODE = "VERIFY_IDENTITY";
  mock.method(console, "log", () => {});
  await import("../../scripts/test-db.mjs");
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].configuration.ssl, { rejectUnauthorized: true, verifyIdentity: true });
});

test("installed mysql2 passes DB_HOST to Node identity verification and rejects a mismatched certificate", () => {
  const host = process.env.DB_HOST;
  for (const certificateHost of [host, "different.mysql.database.azure.com"]) {
    let options, handshake, result;
    const secureSocket = new EventEmitter();
    secureSocket.isSessionReused = () => false;
    secureSocket.getPeerCertificate = () => ({ subjectaltname: `DNS:${certificateHost}` });
    const connect = mock.method(tls, "connect", (configuration, callback) => {
      options = configuration;
      handshake = callback;
      return secureSocket;
    });
    // Exercise the installed driver's TLS upgrade with an inert stream; no MySQL
    // server, TLS listener, credentials, or certificate-chain bypass is involved.
    Connection.prototype.startTLS.call({
      config: { host, port: 3306, ssl: databaseTlsConfiguration({ DB_HOST: host, DB_SSL_MODE: "VERIFY_IDENTITY" }) },
      stream: new EventEmitter(),
    }, error => { result = error ?? "accepted"; });
    assert.equal(options.rejectUnauthorized, true);
    assert.equal(options.servername, host);
    assert.equal(options.checkServerIdentity, tls.checkServerIdentity);
    handshake();
    if (certificateHost === host) assert.equal(result, "accepted");
    else assert.equal(result.code, "ERR_TLS_CERT_ALTNAME_INVALID");
    connect.mock.restore();
  }
});
