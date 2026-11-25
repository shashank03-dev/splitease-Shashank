import { apiRequest } from './apiClient'
import { mapExpenses, mapExpense } from '../utils/apiMappers'

/**
 * GET /api/expenses
 * The API already sorts newest first; the mapper only translates _id/paidBy
 * into the shape the existing balance utilities and components understand.
 */
export async function fetchExpenses({ signal } = {}) {
  const payload = await apiRequest('/expenses', { signal })

  return mapExpenses(payload.data)
}

/** POST /api/expenses */
export async function createExpense({ description, amount, paidBy }) {
  const payload = await apiRequest('/expenses', {
    method: 'POST',
    body: { description, amount, paidBy },
  })

  return mapExpense(payload.data)
}

/** DELETE /api/expenses/:id */
export async function deleteExpense(expenseId) {
  const payload = await apiRequest(
    `/expenses/${encodeURIComponent(expenseId)}`,
    { method: 'DELETE' },
  )

  return payload.data ?? null
}
