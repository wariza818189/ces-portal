import test from "node:test";
import assert from "node:assert/strict";
import { getExpiryHorizon, getExpiryStatus } from "../../lib/expiry.ts";

test("getExpiryHorizon adds 7 days to a normal date", () => {
  assert.equal(getExpiryHorizon("2026-10-24"), "2026-10-31");
});

test("getExpiryHorizon rolls over to the next month", () => {
  assert.equal(getExpiryHorizon("2026-10-28"), "2026-11-04");
});

test("getExpiryHorizon rolls over to the next year", () => {
  assert.equal(getExpiryHorizon("2026-12-28"), "2027-01-04");
});

test("getExpiryHorizon handles February in a non-leap year", () => {
  assert.equal(getExpiryHorizon("2026-02-25"), "2026-03-04");
});

test("getExpiryHorizon handles February in a leap year", () => {
  assert.equal(getExpiryHorizon("2028-02-25"), "2028-03-03");
});

test("getExpiryHorizon caps the result at 9999-12-31", () => {
  assert.equal(getExpiryHorizon("9999-12-25"), "9999-12-31");
});

test("getExpiryHorizon rejects invalid dates", () => {
  assert.throws(() => getExpiryHorizon("2026-02-30"), /Invalid today calendar date/);
  assert.throws(() => getExpiryHorizon("not-a-date"), /Invalid today calendar date/);
});

test("getExpiryStatus returns expired before today", () => {
  assert.equal(getExpiryStatus("2026-10-23", "2026-10-24"), "expired");
});

test("getExpiryStatus returns expiring-soon on today", () => {
  assert.equal(getExpiryStatus("2026-10-24", "2026-10-24"), "expiring-soon");
});

test("getExpiryStatus returns expiring-soon on the last day of the horizon", () => {
  assert.equal(getExpiryStatus("2026-10-31", "2026-10-24"), "expiring-soon");
});

test("getExpiryStatus returns fresh after the horizon", () => {
  assert.equal(getExpiryStatus("2026-11-01", "2026-10-24"), "fresh");
});

test("getExpiryStatus rejects invalid dates", () => {
  assert.throws(() => getExpiryStatus("2026-13-01", "2026-10-24"), /Invalid expiry calendar date/);
  assert.throws(() => getExpiryStatus("2026-10-30", "2026-02-30"), /Invalid today calendar date/);
});