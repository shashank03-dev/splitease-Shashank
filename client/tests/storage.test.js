import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  dismissStorageStatusMessage,
  getStorageStatus,
  readSplitState,
  writeSplitState,
} from '../src/utils/storage.js'

function createMemoryStorage(rawValue) {
  const values = new Map()

  if (rawValue !== undefined) {
    values.set(STORAGE_KEY, rawValue)
  }

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    read(key = STORAGE_KEY) {
      return values.has(key) ? values.get(key) : null
    },
  }
}

const members = [
  { id: 'm1', name: 'Aman' },
  { id: 'm2', name: 'Riya' },
]

const expenses = [
  {
    id: 'e1',
    description: 'Dinner',
    amount: 300,
    payerId: 'm1',
    payerName: 'Aman',
  },
]

test('starts empty and quietly when storage has no snapshot', () => {
  assert.deepEqual(readSplitState(createMemoryStorage()), {
    members: [],
    expenses: [],
    notice: '',
    storageAvailable: true,
  })
})

test('recovers from malformed JSON without throwing', () => {
  const result = readSplitState(createMemoryStorage('{not-json'))

  assert.deepEqual(result.members, [])
  assert.deepEqual(result.expenses, [])
  assert.match(result.notice, /unreadable/)
  assert.equal(result.storageAvailable, true)
})

test('rejects a snapshot with the wrong top-level shape', () => {
  const result = readSplitState(
    createMemoryStorage(JSON.stringify({ members: 'nope', expenses: [] })),
  )

  assert.deepEqual(result.members, [])
  assert.match(result.notice, /unreadable/)
})

test('round-trips a valid versioned snapshot', () => {
  const storage = createMemoryStorage()

  assert.deepEqual(writeSplitState({ members, expenses }, storage), {
    ok: true,
    message: '',
  })

  const saved = JSON.parse(storage.read())

  assert.equal(saved.version, STORAGE_VERSION)
  assert.deepEqual(saved.members, members)
  assert.deepEqual(saved.expenses, expenses)

  assert.deepEqual(readSplitState(storage), {
    members,
    expenses,
    notice: '',
    storageAvailable: true,
  })
})

test('drops invalid members, duplicate names, and excess group size', () => {
  const rawMembers = [
    { id: 'm1', name: '  Aman ' },
    { id: 'm1', name: 'Duplicate id' },
    { id: 'm2', name: 'aman' },
    { id: 'm3', name: 'Riya' },
    { id: '', name: 'No id' },
    'not a member',
    { id: 'm4', name: 'a'.repeat(33) },
  ]
  const result = readSplitState(
    createMemoryStorage(
      JSON.stringify({ version: 1, members: rawMembers, expenses: [] }),
    ),
  )

  assert.deepEqual(result.members, [
    { id: 'm1', name: 'Aman' },
    { id: 'm3', name: 'Riya' },
  ])
  assert.match(result.notice, /5 members/)

  const tooMany = Array.from({ length: 7 }, (_, index) => ({
    id: `m${index}`,
    name: `Person ${index}`,
  }))
  const capped = readSplitState(
    createMemoryStorage(
      JSON.stringify({ version: 1, members: tooMany, expenses: [] }),
    ),
  )

  assert.equal(capped.members.length, 6)
  assert.match(capped.notice, /1 member/)
})

test('drops expenses with invalid data or a missing payer and repairs the payer name', () => {
  const rawExpenses = [
    {
      id: 'e1',
      description: '  Dinner ',
      amount: 300,
      payerId: 'm1',
      payerName: 'Stale name',
    },
    { id: 'e1', description: 'Duplicate', amount: 10, payerId: 'm2' },
    { id: 'e2', description: 'Orphan', amount: 20, payerId: 'gone' },
    { id: 'e3', description: 'String amount', amount: '30', payerId: 'm1' },
    { id: 'e4', description: 'Over-precise', amount: 10.005, payerId: 'm1' },
    { id: 'e5', description: '', amount: 10, payerId: 'm1' },
  ]
  const result = readSplitState(
    createMemoryStorage(
      JSON.stringify({ version: 1, members, expenses: rawExpenses }),
    ),
  )

  assert.deepEqual(result.expenses, [
    {
      id: 'e1',
      description: 'Dinner',
      amount: 300,
      payerId: 'm1',
      payerName: 'Aman',
    },
  ])
  assert.match(result.notice, /5 expenses/)
})

test('normalizes floating-point rupees to exact two-decimal values', () => {
  const result = readSplitState(
    createMemoryStorage(
      JSON.stringify({
        version: 1,
        members,
        expenses: [
          {
            id: 'e1',
            description: 'Tea',
            amount: 0.1 + 0.2,
            payerId: 'm1',
            payerName: 'Aman',
          },
        ],
      }),
    ),
  )

  assert.equal(result.expenses[0].amount, 0.3)
  assert.equal(result.notice, '')
})

test('handles unavailable or throwing storage without crashing', () => {
  const unavailable = readSplitState(null)
  assert.equal(unavailable.storageAvailable, false)
  assert.match(unavailable.notice, /unavailable/)

  const throwing = {
    getItem() {
      throw new Error('blocked')
    },
  }
  const blocked = readSplitState(throwing)
  assert.equal(blocked.storageAvailable, false)
  assert.match(blocked.notice, /could not be read/)

  const writeBlocked = writeSplitState({ members: [], expenses: [] }, null)
  assert.equal(writeBlocked.ok, false)
  assert.match(writeBlocked.message, /unavailable/)
})

test('publishes save failures and can dismiss the message', () => {
  const failingStorage = {
    getItem() {
      return null
    },
    setItem() {
      throw new Error('quota exceeded')
    },
  }

  const result = writeSplitState({ members: [], expenses: [] }, failingStorage)

  assert.equal(result.ok, false)
  assert.match(result.message, /could not be saved/)
  assert.deepEqual(getStorageStatus(), {
    available: false,
    message: result.message,
  })

  dismissStorageStatusMessage()
  assert.deepEqual(getStorageStatus(), { available: false, message: '' })

  writeSplitState({ members: [], expenses: [] }, createMemoryStorage())
  assert.deepEqual(getStorageStatus(), { available: true, message: '' })
})
