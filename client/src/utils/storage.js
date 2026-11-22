import {
  MAX_EXPENSE_DESCRIPTION_LENGTH,
  normalizeDescription,
  toPaise,
} from './expenseUtils.js'
import {
  MAX_GROUP_SIZE,
  MAX_NAME_LENGTH,
  normalizeName,
} from './memberUtils.js'

export const STORAGE_KEY = 'splitease:state:v1'
export const STORAGE_VERSION = 1

const MALFORMED_MESSAGE =
  'Saved data was unreadable, so SplitEasy started with an empty group.'

const READ_ERROR_MESSAGE =
  'Saved data could not be read in this browser. SplitEasy started with an empty group.'

const UNAVAILABLE_MESSAGE =
  'Browser storage is unavailable, so changes will not survive a refresh.'

const storageStatusListeners = new Set()
let storageStatus = { available: true, message: '' }

function updateStorageStatus(nextStatus) {
  if (
    nextStatus.available === storageStatus.available &&
    nextStatus.message === storageStatus.message
  ) {
    return
  }

  storageStatus = nextStatus
  storageStatusListeners.forEach((listener) => listener())
}

/**
 * A tiny external store for persistence feedback. Writing state in an effect
 * is the correct place for a browser side effect; this store lets the UI hear
 * about quota or permission failures without scheduling a second React state
 * update from inside that effect.
 */
export function subscribeToStorageStatus(listener) {
  storageStatusListeners.add(listener)

  return () => {
    storageStatusListeners.delete(listener)
  }
}

export function getStorageStatus() {
  return storageStatus
}

export function dismissStorageStatusMessage() {
  updateStorageStatus({ ...storageStatus, message: '' })
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pluralise(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

/**
 * Rebuilds the member list from untrusted JSON.
 *
 * Only the fields the app relies on are kept. Ids and names must be unique,
 * names are normalized exactly like user input, and the 6-person limit is
 * re-applied so edited or corrupted storage cannot bypass validation.
 */
function sanitizeMembers(rawMembers) {
  const members = []
  const seenIds = new Set()
  const seenNames = new Set()
  let skipped = 0

  rawMembers.forEach((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      typeof entry.name !== 'string' ||
      members.length >= MAX_GROUP_SIZE
    ) {
      skipped += 1
      return
    }

    const id = entry.id.trim()
    const name = normalizeName(entry.name)
    const comparableName = name.toLocaleLowerCase()

    if (
      !id ||
      !name ||
      name.length > MAX_NAME_LENGTH ||
      seenIds.has(id) ||
      seenNames.has(comparableName)
    ) {
      skipped += 1
      return
    }

    seenIds.add(id)
    seenNames.add(comparableName)
    members.push({ id, name })
  })

  return { members, skipped }
}

/**
 * Rebuilds the expense list and reconnects every expense to a surviving member.
 *
 * An expense is only restored when its payer still exists. The payer name is
 * taken from the current member record rather than trusted from storage, which
 * keeps the display relationship consistent even if the saved JSON was edited.
 */
function sanitizeExpenses(rawExpenses, members) {
  const memberById = new Map(members.map((member) => [member.id, member]))
  const seenIds = new Set()
  const expenses = []
  let skipped = 0

  rawExpenses.forEach((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string') {
      skipped += 1
      return
    }

    const id = entry.id.trim()
    const description =
      typeof entry.description === 'string'
        ? normalizeDescription(entry.description)
        : ''
    const payer =
      typeof entry.payerId === 'string' ? memberById.get(entry.payerId) : null
    const amountPaise =
      typeof entry.amount === 'number' ? toPaise(entry.amount) : 0
    const isExactToPaise =
      typeof entry.amount === 'number' &&
      Number.isFinite(entry.amount) &&
      Math.abs(entry.amount * 100 - amountPaise) < 1e-6

    if (
      !id ||
      seenIds.has(id) ||
      !description ||
      description.length > MAX_EXPENSE_DESCRIPTION_LENGTH ||
      !payer ||
      !isExactToPaise ||
      amountPaise <= 0
    ) {
      skipped += 1
      return
    }

    seenIds.add(id)
    expenses.push({
      id,
      description,
      amount: amountPaise / 100,
      payerId: payer.id,
      payerName: payer.name,
    })
  })

  return { expenses, skipped }
}

function buildRecoveryMessage(skippedMembers, skippedExpenses) {
  if (skippedMembers === 0 && skippedExpenses === 0) {
    return ''
  }

  const parts = []

  if (skippedMembers > 0) {
    parts.push(pluralise(skippedMembers, 'member'))
  }

  if (skippedExpenses > 0) {
    parts.push(pluralise(skippedExpenses, 'expense'))
  }

  return `Some saved data was invalid and has been skipped: ${parts.join(
    ' and ',
  )}.`
}

/**
 * Reads one versioned snapshot of the whole app.
 *
 * Members and expenses live under a single key so they are always written
 * together. Every failure mode (no storage, blocked storage, bad JSON, edited
 * data) returns a usable empty or partially recovered state instead of throwing.
 */
export function readSplitState(storage = getDefaultStorage()) {
  if (!storage) {
    return {
      members: [],
      expenses: [],
      notice: UNAVAILABLE_MESSAGE,
      storageAvailable: false,
    }
  }

  let rawValue

  try {
    rawValue = storage.getItem(STORAGE_KEY)
  } catch {
    return {
      members: [],
      expenses: [],
      notice: READ_ERROR_MESSAGE,
      storageAvailable: false,
    }
  }

  if (rawValue === null || rawValue === '') {
    return {
      members: [],
      expenses: [],
      notice: '',
      storageAvailable: true,
    }
  }

  let parsed

  try {
    parsed = JSON.parse(rawValue)
  } catch {
    return {
      members: [],
      expenses: [],
      notice: MALFORMED_MESSAGE,
      storageAvailable: true,
    }
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.members) ||
    !Array.isArray(parsed.expenses)
  ) {
    return {
      members: [],
      expenses: [],
      notice: MALFORMED_MESSAGE,
      storageAvailable: true,
    }
  }

  const { members, skipped: skippedMembers } = sanitizeMembers(parsed.members)
  const { expenses, skipped: skippedExpenses } = sanitizeExpenses(
    parsed.expenses,
    members,
  )

  return {
    members,
    expenses,
    notice: buildRecoveryMessage(skippedMembers, skippedExpenses),
    storageAvailable: true,
  }
}

/**
 * Saves the complete state atomically. Returns a result object because storage
 * failures (private mode, quota, disabled storage) are expected conditions the
 * UI should report rather than exceptions that break rendering.
 */
export function writeSplitState(
  { members = [], expenses = [] },
  storage = getDefaultStorage(),
) {
  if (!storage) {
    const message = UNAVAILABLE_MESSAGE
    updateStorageStatus({ available: false, message })
    return { ok: false, message }
  }

  const snapshot = {
    version: STORAGE_VERSION,
    members: members.map(({ id, name }) => ({ id, name })),
    expenses: expenses.map(
      ({ id, description, amount, payerId, payerName }) => ({
        id,
        description,
        amount,
        payerId,
        payerName,
      }),
    ),
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    updateStorageStatus({ available: true, message: '' })
    return { ok: true, message: '' }
  } catch {
    const message =
      'Changes could not be saved in this browser. They will be lost if you refresh.'
    updateStorageStatus({ available: false, message })
    return { ok: false, message }
  }
}
