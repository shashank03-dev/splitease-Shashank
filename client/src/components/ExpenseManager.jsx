import { useEffect, useState } from 'react'
import {
  calculateGroupBalances,
  calculateSettlements,
} from '../utils/balanceUtils'
import { formatExpenseAmount } from '../utils/expenseUtils'
import DataState from './DataState'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import ExpenseSummary from './ExpenseSummary'
import MemberBalances from './MemberBalances'
import SettlementPlan from './SettlementPlan'

export default function ExpenseManager({
  members,
  expenses,
  canAddExpense,
  isLoading,
  hasLoaded,
  loadError,
  isAdding,
  deletingId,
  isUnavailable,
  onAddExpense,
  onDeleteExpense,
  onRetry,
}) {
  const [feedback, setFeedback] = useState(null)
  const summary = calculateGroupBalances(members, expenses)
  const settlements = calculateSettlements(summary.balances)
  const showSettlementPlan = summary.canSplit && summary.expenseCount > 0
  const showExpenseLog = members.length > 0 || expenses.length > 0
  const showInitialLoading = isLoading && !hasLoaded

  useEffect(() => {
    if (!feedback) {
      return undefined
    }

    const timer = window.setTimeout(() => setFeedback(null), 5000)

    return () => window.clearTimeout(timer)
  }, [feedback])

  async function handleAddExpense(input) {
    const result = await onAddExpense(input)

    if (result.ok) {
      setFeedback(null)
    }

    return result
  }

  async function handleDeleteExpense(expense) {
    const result = await onDeleteExpense(expense.id)

    if (result.ok) {
      setFeedback({
        tone: 'success',
        message: `Deleted “${expense.description}” (${formatExpenseAmount(
          expense.amount,
        )}).`,
      })
    } else {
      setFeedback({
        tone: 'danger',
        message:
          result.message ||
          'Could not delete this expense. Check the API and try again.',
      })
    }

    return result
  }

  let statusLabel = canAddExpense ? 'Open' : 'Locked'
  if (showInitialLoading) statusLabel = 'Loading'
  else if (isUnavailable) statusLabel = 'Offline'

  return (
    <section
      className="expense-card"
      id="expenses"
      aria-labelledby="expenses-heading"
      aria-busy={showInitialLoading || isAdding || Boolean(deletingId)}
    >
      <div className="card-header">
        <div className="card-header__titles">
          <span className="card-header__step">Step 2</span>
          <h2 id="expenses-heading">Expenses</h2>
        </div>

        <div className="card-header__aside">
          <span
            className="card-stat"
            aria-live="polite"
            aria-atomic="true"
          >
            {hasLoaded ? expenses.length : '—'}
            <span> logged</span>
          </span>
          <span
            className={`pill${
              canAddExpense && !showInitialLoading && !isUnavailable
                ? ' pill--success'
                : ''
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <ExpenseForm
        members={members}
        canAddExpense={canAddExpense}
        isBusy={showInitialLoading || isUnavailable}
        isAdding={isAdding}
        onAddExpense={handleAddExpense}
      />

      <div className="card-divider" />

      {showInitialLoading ? (
        <DataState
          status="loading"
          title="Loading expenses…"
          message="Fetching your saved expense log from the SplitEasy API."
        />
      ) : isUnavailable ? (
        <DataState
          status="error"
          title="Expenses could not be loaded."
          message={loadError}
          onRetry={onRetry}
        />
      ) : (
        <>
          <ExpenseSummary summary={summary} />

          {summary.canSplit ? (
            <>
              <div className="card-divider" />
              <MemberBalances
                balances={summary.balances}
                memberCount={summary.memberCount}
              />

              {showSettlementPlan ? (
                <>
                  <div className="card-divider" />
                  <SettlementPlan settlements={settlements} />
                </>
              ) : null}
            </>
          ) : null}

          {showExpenseLog ? (
            <>
              <div className="card-divider" />
              <ExpenseList
                expenses={expenses}
                canAddExpense={canAddExpense}
                deletingId={deletingId}
                onDeleteExpense={handleDeleteExpense}
              />
            </>
          ) : null}

          <p
            className={`action-status${
              feedback?.tone === 'danger' ? ' action-status--danger' : ''
            }`}
            role={feedback?.tone === 'danger' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {feedback?.message ?? ''}
          </p>
        </>
      )}
    </section>
  )
}
