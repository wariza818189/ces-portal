import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import sharp from "sharp";

const renderer = { format: "png", size: 600, margin: 4, ecLevel: "M", dark: "000000", light: "ffffff" } as const;
const maxBytes = 512 * 1024;
type Reason = "CONFIGURATION" | "TIMEOUT" | "NETWORK" | "HTTP_STATUS" | "CONTENT_TYPE" | "RESPONSE_SIZE" | "INVALID_PNG";
class QrFailure extends Error {
  constructor(readonly reason: Reason) { super("Volunteer QR generation failed."); }
}
export type VolunteerQr =
  | { state: "available"; url: string; image: string }
  | { state: "temporarily_unavailable"; url: string }
  | { state: "not_configured" };

function validatedUrl(value: string | undefined): string | null {
  if (!value || value !== value.trim() || /[\u0000-\u001f\u007f-\u009f]/u.test(value)
    || Buffer.byteLength(value, "utf8") > 1024) return null;
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || !url.hostname || url.username || url.password
      || !["/volunteer", "/volunteer/"].includes(url.pathname)
      || url.search || url.hash || value.includes("?") || value.includes("#")) return null;
    return value;
  } catch { return null; }
}

async function generate(url: string): Promise<string> {
  const controller = new AbortController();
  let timedOut = false;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 5000);
  try {
    const response = await fetch("https://quickchart.io/qr", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: url, ...renderer }), redirect: "error",
      cache: "no-store", signal: controller.signal,
    });
    if (!response.ok || response.redirected) throw new QrFailure("HTTP_STATUS");
    if (!/^image\/png(?:\s*;|\s*$)/i.test(response.headers.get("content-type") ?? "")) throw new QrFailure("CONTENT_TYPE");
    const length = response.headers.get("content-length");
    if (length && /^\d+$/.test(length) && Number(length) > maxBytes) throw new QrFailure("RESPONSE_SIZE");
    if (!response.body) throw new QrFailure("RESPONSE_SIZE");
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (timedOut) throw new QrFailure("TIMEOUT");
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBytes) throw new QrFailure("RESPONSE_SIZE");
      chunks.push(chunk.value);
    }
    if (!size) throw new QrFailure("RESPONSE_SIZE");
    const png = Buffer.concat(chunks, size);
    if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new QrFailure("INVALID_PNG");
    try {
      const decoder = sharp(png, { failOn: "warning", limitInputPixels: 360000, animated: true });
      const metadata = await decoder.metadata();
      if (metadata.format !== "png" || (metadata.pages ?? 1) !== 1 || metadata.width !== 600 || metadata.height !== 600) throw new QrFailure("INVALID_PNG");
      await decoder.raw().toBuffer();
    } catch { throw new QrFailure("INVALID_PNG"); }
    if (timedOut) throw new QrFailure("TIMEOUT");
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (error) {
    throw new QrFailure(timedOut ? "TIMEOUT" : error instanceof QrFailure ? error.reason : "NETWORK");
  } finally {
    clearTimeout(timer);
    controller.abort();
    if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  }
}

export async function getVolunteerQr(): Promise<VolunteerQr> {
  const url = validatedUrl(process.env.VOLUNTEER_SIGNUP_URL);
  if (!url) {
    console.error("Volunteer QR generation failed.", { code: "CONFIGURATION" });
    return { state: "not_configured" };
  }
  const identity = createHash("sha256").update(JSON.stringify({ url, ...renderer })).digest("hex");
  try {
    // Throwing failures prevents unstable_cache from persisting an unavailable result.
    const image = await unstable_cache(() => generate(url), ["volunteer-qr-v1", identity], { revalidate: 86400 })();
    return { state: "available", url, image };
  } catch (error) {
    console.error("Volunteer QR generation failed.", { code: error instanceof QrFailure ? error.reason : "NETWORK" });
    return { state: "temporarily_unavailable", url };
  }
}
