import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'

export default function ExpenseManager({
  members,
  expenses,
  canAddExpense,
  onAddExpense,
}) {
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

      {expenses.length > 0 ? (
        <>
          <div className="expense-card__divider" />
          <ExpenseList expenses={expenses} />
        </>
      ) : null}
    </section>
  )
}
