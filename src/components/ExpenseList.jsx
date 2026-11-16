import { formatExpenseAmount } from '../utils/expenseUtils'
import { getInitials } from '../utils/memberUtils'

export default function ExpenseList({ expenses }) {
  if (expenses.length === 0) {
    return null
  }

  return (
    <div className="expense-list">
      <ul className="expense-list__items" aria-label="Expense log">
        {expenses.map((expense) => (
          <li className="expense" key={expense.id}>
            <span className="avatar" aria-hidden="true">
              {getInitials(expense.payerName)}
            </span>

            <span className="expense__details">
              <span className="expense__description">
                {expense.description}
              </span>
              <span className="expense__payer">
                Paid by {expense.payerName}
              </span>
            </span>

            <span className="expense__amount">
              {formatExpenseAmount(expense.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
