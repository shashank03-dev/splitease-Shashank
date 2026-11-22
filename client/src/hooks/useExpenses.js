import { useCallback, useState } from 'react'
import { MIN_GROUP_SIZE } from '../utils/memberUtils'
import { validateExpense } from '../utils/expenseUtils'
import { createExpenseId } from '../utils/id'

/**
 * Owns the expense array and the rules for adding and deleting an expense.
 *
 * Expenses are prepended so the newest entry appears first. The payer id
 * remains the source relationship; payerName is a snapshot so the log stays
 * readable. The app prevents a member with linked expenses from being removed,
 * and storage reconnects every restored expense to a current member.
 */
export function useExpenses(members, initialExpenses = []) {
  const [expenses, setExpenses] = useState(initialExpenses)
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

  const removeExpense = useCallback((expenseId) => {
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== expenseId),
    )
  }, [])

  return {
    expenses,
    canAddExpense,
    addExpense,
    removeExpense,
  }
}
