import { ApiError } from '../services/apiClient.js'

/**
 * The API is the source of truth, but its documents use MongoDB field names.
 * These small, pure mappers translate once at the network boundary so every
 * existing component and balance utility keeps its stable { id, payerId }
 * shape. No second copy of the data is stored anywhere.
 */

function invalidRecord(resource) {
  return new ApiError(`The API returned an invalid ${resource} record.`, {
    status: 502,
    kind: 'invalid-response',
  })
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function mapPerson(rawPerson) {
  if (
    !isRecord(rawPerson) ||
    typeof rawPerson._id !== 'string' ||
    rawPerson._id.trim() === '' ||
    typeof rawPerson.name !== 'string' ||
    rawPerson.name.trim() === ''
  ) {
    throw invalidRecord('person')
  }

  return {
    // Keep the real MongoDB _id. It is the id sent to DELETE endpoints and
    // used as the React key, so no client-generated ids can drift from Mongo.
    id: rawPerson._id,
    name: rawPerson.name.trim(),
  }
}

export function mapPeople(rawPeople) {
  if (!Array.isArray(rawPeople)) {
    throw invalidRecord('people collection')
  }

  return rawPeople.map(mapPerson)
}

export function mapExpense(rawExpense) {
  if (!isRecord(rawExpense) || typeof rawExpense._id !== 'string') {
    throw invalidRecord('expense')
  }

  const payerId =
    typeof rawExpense.paidBy === 'string'
      ? rawExpense.paidBy
      : rawExpense.paidBy?._id

  if (
    rawExpense._id.trim() === '' ||
    typeof rawExpense.description !== 'string' ||
    rawExpense.description.trim() === '' ||
    typeof rawExpense.amount !== 'number' ||
    !Number.isFinite(rawExpense.amount) ||
    typeof payerId !== 'string' ||
    payerId.trim() === ''
  ) {
    throw invalidRecord('expense')
  }

  return {
    id: rawExpense._id,
    description: rawExpense.description,
    amount: rawExpense.amount,
    payerId,
    date: typeof rawExpense.date === 'string' ? rawExpense.date : null,
    createdAt:
      typeof rawExpense.createdAt === 'string' ? rawExpense.createdAt : null,
  }
}

export function mapExpenses(rawExpenses) {
  if (!Array.isArray(rawExpenses)) {
    throw invalidRecord('expense collection')
  }

  return rawExpenses.map(mapExpense)
}

/** Case-insensitive alphabetical order, matching the API's people sort. */
export function sortPeopleByName(people) {
  return [...people].sort((left, right) =>
    left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }),
  )
}

/**
 * Joins the two API collections for display. The relationship remains payerId;
 * payerName is derived on every render and is never persisted separately.
 */
export function withPayerNames(expenses, people) {
  const namesById = new Map(people.map((person) => [person.id, person.name]))

  return expenses.map((expense) => ({
    ...expense,
    payerName: namesById.get(expense.payerId) ?? 'Unknown member',
  }))
}
