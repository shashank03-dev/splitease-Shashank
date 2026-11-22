import { useEffect, useState } from 'react'
import {
  calculateGroupBalances,
  calculateSettlements,
} from '../utils/balanceUtils'
import { formatExpenseAmount } from '../utils/expenseUtils'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import ExpenseSummary from './ExpenseSummary'
import MemberBalances from './MemberBalances'
import SettlementPlan from './SettlementPlan'

export default function ExpenseManager({
  members,
  expenses,
  canAddExpense,
  onAddExpense,
  onDeleteExpense,
}) {
  const [feedback, setFeedback] = useState('')
  const summary = calculateGroupBalances(members, expenses)
  const settlements = calculateSettlements(summary.balances)
  const showSettlementPlan = summary.canSplit && summary.expenseCount > 0
  const showExpenseLog = members.length > 0 || expenses.length > 0

  useEffect(() => {
    if (!feedback) {
      return undefined
    }

    const timer = window.setTimeout(() => setFeedback(''), 5000)

    return () => window.clearTimeout(timer)
  }, [feedback])

  function handleAddExpense(input) {
    const result = onAddExpense(input)

    if (result.ok) {
      setFeedback('')
    }

    return result
  }

  function handleDeleteExpense(expense) {
    onDeleteExpense(expense.id)
    setFeedback(
      `Deleted “${expense.description}” (${formatExpenseAmount(
        expense.amount,
      )}).`,
    )
  }

  return (
    <section
      className="expense-card"
      id="expenses"
      aria-labelledby="expenses-heading"
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
            {expenses.length}
            <span> logged</span>
          </span>
          <span className={`pill${canAddExpense ? ' pill--success' : ''}`}>
            {canAddExpense ? 'Open' : 'Locked'}
          </span>
        </div>
      </div>

      <ExpenseForm
        members={members}
        canAddExpense={canAddExpense}
        onAddExpense={handleAddExpense}
      />

      <div className="card-divider" />

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
            onDeleteExpense={handleDeleteExpense}
          />
        </>
      ) : null}

      <p className="action-status" role="status" aria-live="polite">
        {feedback}
      </p>
    </section>
  )
}
