import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_EXPENSE_DESCRIPTION_LENGTH,
  normalizeDescription,
  validateExpense,
} from '../src/utils/expenseUtils.js'

const members = [
  { id: 'aman', name: 'Aman' },
  { id: 'riya', name: 'Riya' },
]

function validate(overrides = {}) {
  return validateExpense(
    {
      description: 'Dinner',
      amount: '300',
      payerId: 'aman',
      ...overrides,
    },
    members,
  )
}

test('normalizes descriptive whitespace', () => {
  assert.equal(normalizeDescription('  Team   dinner  '), 'Team dinner')
  assert.equal(normalizeDescription(null), '')
})

test('rejects empty and overlong expense descriptions', () => {
  assert.deepEqual(validate({ description: '   ' }), {
    ok: false,
    field: 'description',
    message: 'Enter what the expense was for.',
  })

  const result = validate({
    description: 'a'.repeat(MAX_EXPENSE_DESCRIPTION_LENGTH + 1),
  })

  assert.equal(result.ok, false)
  assert.equal(result.field, 'description')
})

test('rejects empty, malformed, zero, and over-precise amounts', () => {
  assert.deepEqual(validate({ amount: '  ' }), {
    ok: false,
    field: 'amount',
    message: 'Enter an amount.',
  })

  for (const amount of ['abc', '10,50', '-20', '10.999', '1e3', '.50']) {
    const result = validate({ amount })

    assert.equal(result.ok, false, `${amount} should be rejected`)
    assert.equal(result.field, 'amount')
  }

  assert.deepEqual(validate({ amount: '0' }), {
    ok: false,
    field: 'amount',
    message: 'Amount must be greater than zero.',
  })
  assert.deepEqual(validate({ amount: '0.00' }), {
    ok: false,
    field: 'amount',
    message: 'Amount must be greater than zero.',
  })
})

test('rejects a missing or unknown payer', () => {
  assert.deepEqual(validate({ payerId: '' }), {
    ok: false,
    field: 'payerId',
    message: 'Choose who paid.',
  })

  assert.deepEqual(validate({ payerId: 'missing' }), {
    ok: false,
    field: 'payerId',
    message: 'Choose a current group member.',
  })
})

test('accepts a valid decimal expense and snapshots the payer name', () => {
  assert.deepEqual(validate({ amount: ' 399.75 ', description: '  Cab  ' }), {
    ok: true,
    expense: {
      description: 'Cab',
      amount: 399.75,
      payerId: 'aman',
      payerName: 'Aman',
    },
  })
})

test('accepts integer amounts and amounts with one decimal', () => {
  assert.equal(validate({ amount: '1200' }).expense.amount, 1200)
  assert.equal(validate({ amount: '0.5' }).expense.amount, 0.5)
  assert.equal(validate({ amount: '10.05' }).expense.amount, 10.05)
})
