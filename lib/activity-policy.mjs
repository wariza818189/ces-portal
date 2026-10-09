export const ACTIVITY_STATUSES = Object.freeze(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']);
export const ACTIVITY_TRANSITIONS = Object.freeze({
  DRAFT: Object.freeze(['ACTIVE', 'ARCHIVED']),
  ACTIVE: Object.freeze(['CLOSED']),
  CLOSED: Object.freeze(['ACTIVE', 'ARCHIVED']),
  ARCHIVED: Object.freeze([]),
});
export const ACTIVITY_FIELDS = Object.freeze(['name', 'activity_date', 'venue_name', 'latitude', 'longitude']);
/** @param {unknown} value */
export function validActivityId(value) {
  return typeof value === 'string' && /^[1-9]\d{0,19}$/.test(value) && BigInt(value) <= BigInt('18446744073709551615');
}
/** @param {unknown} value */
export function validRevision(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 4294967295;
}
/** Exact persistence format, with six fractional places; null means absent.
 * @param {unknown} value @param {number} limit
 */
export function validStoredCoordinate(value, limit) {
  if (value === null) return true;
  if (typeof value !== 'string' || !/^-?\d{1,3}\.\d{6}$/.test(value)) return false;
  const scaled = BigInt(value.replace('.', ''));
  return scaled >= -BigInt(limit) * BigInt(1000000) && scaled <= BigInt(limit) * BigInt(1000000);
}
