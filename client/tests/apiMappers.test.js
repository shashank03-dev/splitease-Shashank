import test from 'node:test'
import assert from 'node:assert/strict'
import {
  mapExpense,
  mapPeople,
  mapPerson,
  sortPeopleByName,
  withPayerNames,
} from '../src/utils/apiMappers.js'

test('maps a Mongo person document to the UI shape', () => {
  assert.deepEqual(
    mapPerson({
      _id: '66c8f1a2b3c4d5e6f7890abc',
      name: '  Aman  ',
      createdAt: '2026-11-25T10:00:00.000Z',
    }),
    { id: '66c8f1a2b3c4d5e6f7890abc', name: 'Aman' },
  )
})

test('maps an expense and keeps the MongoDB ids', () => {
  assert.deepEqual(
    mapExpense({
      _id: '66c8f1a2b3c4d5e6f7890def',
      description: 'Dinner',
      amount: 1200,
      paidBy: '66c8f1a2b3c4d5e6f7890abc',
      date: '2026-11-25T10:00:00.000Z',
      createdAt: '2026-11-25T10:00:00.000Z',
    }),
    {
      id: '66c8f1a2b3c4d5e6f7890def',
      description: 'Dinner',
      amount: 1200,
      payerId: '66c8f1a2b3c4d5e6f7890abc',
      date: '2026-11-25T10:00:00.000Z',
      createdAt: '2026-11-25T10:00:00.000Z',
    },
  )
})

test('accepts a populated paidBy object without storing a second name copy', () => {
  const expense = mapExpense({
    _id: '66c8f1a2b3c4d5e6f7890def',
    description: 'Cab',
    amount: 399.75,
    paidBy: { _id: '66c8f1a2b3c4d5e6f7890abc', name: 'Aman' },
  })

  assert.equal(expense.payerId, '66c8f1a2b3c4d5e6f7890abc')
  assert.equal('payerName' in expense, false)
})

test('rejects malformed API records instead of rendering them', () => {
  assert.throws(() => mapPerson({ name: 'No id' }), /invalid person record/)
  assert.throws(
    () => mapExpense({ _id: 'e1', description: 'Tea', amount: '10' }),
    /invalid expense record/,
  )
  assert.throws(() => mapPeople({ data: [] }), /invalid people collection/)
})

test('joins payer names from current people without persisting them', () => {
  const people = [
    { id: 'person-1', name: 'Aman' },
    { id: 'person-2', name: 'Riya' },
  ]
  const expenses = [
    { id: 'expense-1', description: 'Dinner', amount: 300, payerId: 'person-1' },
    { id: 'expense-2', description: 'Cab', amount: 100, payerId: 'gone' },
  ]

  assert.deepEqual(
    withPayerNames(expenses, people).map(({ payerName }) => payerName),
    ['Aman', 'Unknown member'],
  )
  assert.equal('payerName' in expenses[0], false)
})

test('sorts people case-insensitively without mutating the input', () => {
  const people = [
    { id: '2', name: 'Zara' },
    { id: '1', name: 'aman' },
    { id: '3', name: 'Riya' },
  ]

  assert.deepEqual(
    sortPeopleByName(people).map(({ name }) => name),
    ['aman', 'Riya', 'Zara'],
  )
  assert.equal(people[0].name, 'Zara')
})
