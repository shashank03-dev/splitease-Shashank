import { calculateGroupBalances } from '../utils/balanceUtils'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'
import ExpenseSummary from './ExpenseSummary'
import MemberBalances from './MemberBalances'

export default function ExpenseManager({
  members,
  expenses,
  canAddExpense,
  onAddExpense,
}) {
  const summary = calculateGroupBalances(members, expenses)

  return (
    <section
      className="expense-card"
      id="expenses"
      aria-labelledby="expenses-heading"
    >
      <div className="expense-card__header">
        <h2 id="expenses-heading">Expenses</h2>

        <div className="expense-card__aside">
          <span
            className="expense-stat"
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
        onAddExpense={onAddExpense}
      />

      <div className="expense-card__divider" />

      <ExpenseSummary summary={summary} />

      {summary.canSplit ? (
        <>
          <div className="expense-card__divider" />
          <MemberBalances
            balances={summary.balances}
            memberCount={summary.memberCount}
          />
        </>
      ) : null}

      {expenses.length > 0 ? (
        <>
          <div className="expense-card__divider" />
          <ExpenseList expenses={expenses} />
        </>
      ) : null}
    </section>
  )
}
