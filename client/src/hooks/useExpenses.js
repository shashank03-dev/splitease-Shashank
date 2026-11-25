import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getApiErrorField,
  getApiErrorMessage,
} from '../services/apiClient'
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
} from '../services/expensesApi'
import { validateExpense } from '../utils/expenseUtils'
import { MIN_GROUP_SIZE } from '../utils/memberUtils'

/**
 * Owns the MongoDB-backed expense collection.
 *
 * The Week 1 validation and money rules are unchanged: validation still runs
 * before the request, and the existing balance utilities still derive every
 * total from the returned list. Only the persistence boundary moved from
 * localStorage to POST/DELETE /api/expenses.
 */
export function useExpenses(members = []) {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const latestRequestId = useRef(0)
  const canAddExpense = members.length >= MIN_GROUP_SIZE

  const loadExpenses = useCallback(async ({ silent = false } = {}) => {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId

    if (!silent) {
      setIsLoading(true)
      setLoadError('')
    }

    try {
      const nextExpenses = await fetchExpenses()

      if (requestId === latestRequestId.current) {
        setExpenses(nextExpenses)
        setHasLoaded(true)
        setLoadError('')
      }

      return { ok: true }
    } catch (loadFailure) {
      if (loadFailure?.name === 'AbortError') {
        return { ok: false, aborted: true }
      }

      const message = getApiErrorMessage(
        loadFailure,
        'Could not load expenses from the SplitEasy API.',
      )

      if (requestId === latestRequestId.current) {
        setLoadError(message)
      }

      return { ok: false, message }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId

    fetchExpenses({ signal: controller.signal })
      .then((nextExpenses) => {
        if (requestId !== latestRequestId.current) {
          return
        }

        setExpenses(nextExpenses)
        setHasLoaded(true)
        setLoadError('')
      })
      .catch((loadFailure) => {
        if (
          loadFailure?.name === 'AbortError' ||
          requestId !== latestRequestId.current
        ) {
          return
        }

        setLoadError(
          getApiErrorMessage(
            loadFailure,
            'Could not load expenses from the SplitEasy API.',
          ),
        )
      })
      .finally(() => {
        if (
          requestId === latestRequestId.current &&
          !controller.signal.aborted
        ) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  const addExpense = useCallback(
    async (input) => {
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

      setIsAdding(true)

      try {
        const createdExpense = await createExpense({
          description: validation.expense.description,
          amount: validation.expense.amount,
          paidBy: validation.expense.payerId,
        })

        setExpenses((currentExpenses) => [
          createdExpense,
          ...currentExpenses.filter(
            (expense) => expense.id !== createdExpense.id,
          ),
        ])

        await loadExpenses({ silent: true })

        return { ok: true, expense: createdExpense }
      } catch (failure) {
        return {
          ok: false,
          field: getApiErrorField(failure) || 'form',
          message: getApiErrorMessage(
            failure,
            'Could not add this expense. Please try again.',
          ),
        }
      } finally {
        setIsAdding(false)
      }
    },
    [canAddExpense, loadExpenses, members],
  )

  const removeExpense = useCallback(
    async (expenseId) => {
      setDeletingId(expenseId)

      try {
        await deleteExpense(expenseId)
        setExpenses((currentExpenses) =>
          currentExpenses.filter((expense) => expense.id !== expenseId),
        )

        await loadExpenses({ silent: true })

        return { ok: true }
      } catch (failure) {
        return {
          ok: false,
          message: getApiErrorMessage(
            failure,
            'Could not delete this expense. Please try again.',
          ),
        }
      } finally {
        setDeletingId(null)
      }
    },
    [loadExpenses],
  )

  const retry = useCallback(() => loadExpenses(), [loadExpenses])

  const refresh = useCallback(
    () => loadExpenses({ silent: true }),
    [loadExpenses],
  )

  return {
    expenses,
    canAddExpense,
    isLoading,
    hasLoaded,
    loadError,
    isAdding,
    deletingId,
    addExpense,
    removeExpense,
    retry,
    refresh,
  }
}
