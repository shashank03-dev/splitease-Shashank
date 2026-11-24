const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i

/**
 * Strict 24-character hex check. `mongoose.isValidObjectId` also accepts
 * 12-byte strings, which we do not want to treat as API ids.
 */
export function isObjectId(value) {
  return typeof value === 'string' && OBJECT_ID_PATTERN.test(value)
}
