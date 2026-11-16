import { useCallback, useState } from 'react'
import { MIN_GROUP_SIZE } from '../utils/memberUtils'
import { validateExpense } from '../utils/expenseUtils'
import { createExpenseId } from '../utils/id'

/**
 * Owns the expense array and the rules for adding an expense.
 *
 * Expenses are prepended so the newest entry appears first. The payer id
 * remains the source relationship; payerName is a snapshot so history
 * stays readable if that member is later removed from the group.
 */
export function useExpenses(members) {
  const [expenses, setExpenses] = useState([])
  const canAddExpense = members.length >= MIN_GROUP_SIZE

  const addExpense = useCallback(
    (input) => {
      if (!canAddExpense) {
        return {
          ok: false,
          field: 'form',
          message: 'Add at least two members before logging an expense.',
        }
      }

      const validation = validateExpense(input, members)

      if (!validation.ok) {
        return validation
      }

      const expense = {
        id: createExpenseId(),
        ...validation.expense,
      }

      setExpenses((currentExpenses) => [expense, ...currentExpenses])

      return { ok: true, expense }
    },
    [canAddExpense, members],
  )

  return {
    expenses,
    canAddExpense,
    addExpense,
  }
}
