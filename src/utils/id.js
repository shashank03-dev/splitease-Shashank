function createUniqueId(prefix = '') {
  const suffix =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

  return prefix ? `${prefix}-${suffix}` : suffix
}

/**
 * Returns a unique id for a new group member. Modern browsers provide
 * crypto.randomUUID(); the timestamp/random fallback keeps older
 * browsers working and preserves the same data shape.
 */
export function createMemberId() {
  return createUniqueId()
}

/**
 * Returns a unique id for a new expense. The prefix makes stored
 * records easier to identify while debugging without changing the
 * shape of member ids.
 */
export function createExpenseId() {
  return createUniqueId('expense')
}
