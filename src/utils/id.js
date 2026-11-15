/**
 * Returns a unique id for a new group member. Modern browsers provide
 * crypto.randomUUID(); the timestamp/random fallback keeps older
 * browsers working and preserves the same data shape.
 */
export function createMemberId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `member-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
