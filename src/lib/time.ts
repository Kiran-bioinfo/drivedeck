// Null-safe Firestore timestamp helpers (audit: pending timestamps + malformed
// records crash rendering).
//
// A pending `serverTimestamp()` resolves to `null` in the local snapshot, and a
// legacy document can omit the field entirely. Code that does
// `doc.updatedAt.toMillis()` throws a TypeError in both cases, which kills the
// onSnapshot callback and strands the page on a loading skeleton.

/** Epoch milliseconds for a Firestore Timestamp, or 0 when it is null/missing/invalid. */
export function epochMs(t: unknown): number {
  const d = (t as { toDate?: () => Date } | null | undefined)?.toDate?.();
  return d ? d.getTime() : 0;
}

/** Date for a Firestore Timestamp, or null when it is null/missing/invalid. */
export function toDateOrNull(t: unknown): Date | null {
  const ms = epochMs(t);
  return ms ? new Date(ms) : null;
}
