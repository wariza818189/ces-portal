import { isValidIsoDate } from "@/lib/date";

export type ExpiryStatus = "expired" | "expiring-soon" | "fresh";

export function getExpiryHorizon(today: string): string {
  if (!isValidIsoDate(today)) {
    throw new Error("Invalid today calendar date.");
  }
  const [year, month, day] = today.split("-").map(Number);
  const horizon = new Date(Date.UTC(year, month - 1, day));
  horizon.setUTCDate(horizon.getUTCDate() + 7);
  if (horizon.getUTCFullYear() > 9999) {
    return "9999-12-31";
  }
  return [
    String(horizon.getUTCFullYear()).padStart(4, "0"),
    String(horizon.getUTCMonth() + 1).padStart(2, "0"),
    String(horizon.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getExpiryStatus(expiryDate: string, today: string): ExpiryStatus {
  if (!isValidIsoDate(expiryDate)) {
    throw new Error("Invalid expiry calendar date.");
  }
  const horizon = getExpiryHorizon(today);
  if (expiryDate < today) return "expired";
  return expiryDate <= horizon ? "expiring-soon" : "fresh";
}
