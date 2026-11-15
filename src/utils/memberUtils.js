export const MIN_GROUP_SIZE = 2
export const MAX_GROUP_SIZE = 6
export const MAX_NAME_LENGTH = 32

/**
 * Trims the edges and collapses repeated spaces so that
 * "  Aman   Kumar  " is stored as "Aman Kumar".
 */
export function normalizeName(rawName = '') {
  return String(rawName ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Validates a proposed member name against the rules for Day 1.
 * Returns a result object instead of throwing so the UI can decide
 * what to display without using exceptions for expected input errors.
 */
export function validateMemberName(rawName, members) {
  const name = normalizeName(rawName)

  if (!name) {
    return {
      ok: false,
      message: 'Enter a name.',
    }
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      message: `Use ${MAX_NAME_LENGTH} characters or fewer.`,
    }
  }

  const normalizedName = name.toLocaleLowerCase()
  const isDuplicate = members.some(
    (member) => member.name.toLocaleLowerCase() === normalizedName,
  )

  if (isDuplicate) {
    return {
      ok: false,
      message: `${name} is already in the group.`,
    }
  }

  return { ok: true, name }
}

export function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return '?'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}
