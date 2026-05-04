/**
 * SLA Service — Core business logic for shipment delay detection.
 *
 * Design decision: SLA is ALWAYS computed at read time from the current
 * clock, never stored. This guarantees accuracy with zero infrastructure
 * overhead (no cron jobs, no stale flags).
 */

const TERMINAL_STATUSES = ['Delivered', 'Failed'];
const WARNING_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes in ms

/**
 * Compute the SLA status for a given order.
 *
 * @param {Object} order - Mongoose order document (or plain object)
 * @param {Date}   [now]  - Override current time (useful for testing)
 * @returns {{ isDelayed: boolean, delayDuration: string|null, timeUntilDue: string|null }}
 */
const computeSLAStatus = (order, now = new Date()) => {
  // Terminal statuses: SLA no longer applies
  if (TERMINAL_STATUSES.includes(order.status)) {
    return { isDelayed: false, delayDuration: null, timeUntilDue: null };
  }

  const deadline = new Date(order.promisedDeliveryTime);
  const diffMs = now - deadline;

  // ── Case 1: Currently delayed ────────────────────────────────────────────
  if (diffMs > 0) {
    return {
      isDelayed: true,
      delayDuration: formatDuration(diffMs),
      timeUntilDue: null,
    };
  }

  // ── Case 2: Due within warning window ────────────────────────────────────
  const remainingMs = Math.abs(diffMs);
  if (remainingMs <= WARNING_THRESHOLD_MS) {
    const minutes = Math.ceil(remainingMs / 60000);
    return {
      isDelayed: false,
      delayDuration: null,
      timeUntilDue: `Due in ${minutes}m`,
    };
  }

  // ── Case 3: On track ─────────────────────────────────────────────────────
  return { isDelayed: false, delayDuration: null, timeUntilDue: null };
};

/**
 * Format a millisecond duration into a human-readable string.
 * Examples: 9000000ms → "2h 30m"  |  45000ms → "< 1m"
 *
 * @param {number} ms - Duration in milliseconds (must be positive)
 * @returns {string}
 */
const formatDuration = (ms) => {
  if (ms < 60000) return '< 1m';

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

/**
 * Filter an array of orders by delayed status.
 * Useful for stats computation without a DB round-trip.
 *
 * @param {Array} orders
 * @returns {Array}
 */
const filterDelayed = (orders) =>
  orders.filter((o) => computeSLAStatus(o).isDelayed);

module.exports = { computeSLAStatus, formatDuration, filterDelayed };
