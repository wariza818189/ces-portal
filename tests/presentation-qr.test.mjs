import test, { after } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import sharp from "sharp";
import { renderToStaticMarkup } from "react-dom/server";

const cache = "data:text/javascript,export const unstable_cache = work => work;";
// Node's CJS interop needs the same default normalization Next's bundler supplies.
const imageAdapter = `data:text/javascript,${encodeURIComponent(`import Image from ${JSON.stringify(new URL("../node_modules/next/image.js", import.meta.url).href)}; export default Image.default ?? Image;`)}`;
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "next/cache") return { url: cache, shortCircuit: true };
    if (specifier === "next/image") return { url: imageAdapter, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".module.css")) return { format: "module", source: "export default {};", shortCircuit: true };
    return next(url, context);
  },
});
const originalFetch = globalThis.fetch;
const originalUrl = process.env.VOLUNTEER_SIGNUP_URL;
const url = "https://ces-portal-demo-2026-gwhzg4c0hadshmd9.eastasia-01.azurewebsites.net/volunteer";
Object.assign(process.env, { DB_HOST: "markup.invalid", DB_PORT: "1", DB_USER: "synthetic", DB_PASSWORD: "synthetic-only", DB_NAME: "ces_qr_markup" });
const { getVolunteerQr } = await import("../lib/volunteer-qr.ts");
const { default: Poster } = await import("../app/(staff)/volunteers/poster/page.tsx");
const { db } = await import("../lib/db.ts");
const { withRequest } = await import("./r1/framework.mjs");
const execute = db.execute;
db.execute = async () => [[{ id: "1", name: "Synthetic Admin", username: "qa", role: "ADMIN" }]];
const poster = () => withRequest("a".repeat(64), async () => renderToStaticMarkup(await Poster()));
after(() => { hooks.deregister(); globalThis.fetch = originalFetch; db.execute = execute; if (originalUrl === undefined) delete process.env.VOLUNTEER_SIGNUP_URL; else process.env.VOLUNTEER_SIGNUP_URL = originalUrl; });

test("unconfigured or invalid signup URLs never call the provider and never offer a misleading scan instruction", async () => {
  let calls = 0; globalThis.fetch = async () => { calls++; throw new Error("Unexpected request"); };
  for (const value of ["", ` ${url}`, `${url}?tracking=1`, "https://user:password@example.invalid/volunteer", "https://example.invalid/other"]) {
    process.env.VOLUNTEER_SIGNUP_URL = value;
    assert.deepEqual(await getVolunteerQr(), { state: "not_configured" });
  }
  process.env.VOLUNTEER_SIGNUP_URL = "";
  const html = await poster();
  assert.match(html, /link is not configured/); assert.ok(!html.includes("Scan to open") && !html.includes("<img"));
  assert.equal(calls, 0);
});

test("configured success preserves QuickChart POST contract, validates 600px PNG, and displays exact direct link", async () => {
  const png = await sharp({ create: { width: 600, height: 600, channels: 3, background: "white" } }).png().toBuffer();
  let request;
  globalThis.fetch = async (endpoint, options) => { request = { endpoint, options }; return new Response(png, { headers: { "content-type": "image/png" } }); };
  process.env.VOLUNTEER_SIGNUP_URL = url;
  const result = await getVolunteerQr();
  assert.equal(result.state, "available"); assert.equal(result.url, url); assert.match(result.image, /^data:image\/png;base64,/);
  assert.equal(request.endpoint, "https://quickchart.io/qr"); assert.equal(request.options.method, "POST"); assert.equal(request.options.redirect, "error");
  assert.deepEqual(JSON.parse(request.options.body), { text: url, format: "png", size: 600, margin: 4, ecLevel: "M", dark: "000000", light: "ffffff" });
  const html = await poster(); assert.ok(html.includes(`href="${url}"`) && html.includes("Scan to open Volunteer Signup"));
  assert.match(html, /Do not submit real personal or contact information/);
  // This white PNG tests image validation/rendering, not an actual scannable QR.
});

test("provider failure retains the configured direct link and clear fallback without scan-only guidance", async () => {
  process.env.VOLUNTEER_SIGNUP_URL = url;
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  assert.deepEqual(await getVolunteerQr(), { state: "temporarily_unavailable", url });
  const html = await poster(); assert.match(html, /QR generation is temporarily unavailable/);
  assert.ok(html.includes(`href="${url}"`) && !html.includes("Scan to open"));
});
