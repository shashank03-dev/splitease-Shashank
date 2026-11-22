import { useEffect, useId, useRef } from 'react'
import { formatExpenseAmount } from '../utils/expenseUtils'
import { getInitials } from '../utils/memberUtils'
import { ReceiptIcon, TrashIcon } from './ui/Icons'

export default function ExpenseList({
  expenses,
  canAddExpense,
  onDeleteExpense,
}) {
  const headingId = useId()
  const emptyRef = useRef(null)
  const deleteButtonRefs = useRef(new Map())
  const pendingFocusRef = useRef(null)

  /**
   * Keep keyboard focus inside the expense log after a deletion. Focus moves
   * to the next (or previous) row's delete button, or to the empty state when
   * the last row is removed.
   */
  useEffect(() => {
    const target = pendingFocusRef.current

    if (!target) {
      return
    }

    pendingFocusRef.current = null

    if (target === 'empty') {
      emptyRef.current?.focus()
      return
    }

    deleteButtonRefs.current.get(target)?.focus()
  }, [expenses])

  function handleDelete(expense, index) {
    const remaining = expenses.filter((entry) => entry.id !== expense.id)
    const nextExpense = remaining[index] ?? remaining[index - 1] ?? null

    pendingFocusRef.current = nextExpense ? nextExpense.id : 'empty'
    onDeleteExpense(expense)
  }

  return (
    <section className="expense-log" aria-labelledby={headingId}>
      <div className="section-heading">
        <h3 id={headingId}>Expense log</h3>
        {expenses.length > 0 ? (
          <span className="section-note">Newest first</span>
        ) : null}
      </div>

      {expenses.length === 0 ? (
        <div
          ref={emptyRef}
          className="empty-state empty-state--compact"
          tabIndex={-1}
        >
          <ReceiptIcon className="empty-state__icon" size={20} />
          <div>
            <p className="empty-state__title">No expenses yet</p>
            <p className="empty-state__copy">
              {canAddExpense
                ? 'Log the first shared cost above and the totals will update here.'
                : 'Add two members above to start logging shared costs.'}
            </p>
          </div>
        </div>
      ) : (
        <ul className="expense-list__items" aria-label="Expense log">
          {expenses.map((expense, index) => {
            const formattedAmount = formatExpenseAmount(expense.amount)
            const deleteLabel = `Delete ${expense.description}, ${formattedAmount}`

            return (
              <li className="expense" key={expense.id}>
                <span className="avatar" aria-hidden="true">
                  {getInitials(expense.payerName)}
                </span>

                <span className="expense__details">
                  <span
                    className="expense__description"
                    title={expense.description}
                  >
                    {expense.description}
                  </span>
                  <span className="expense__payer">
                    Paid by {expense.payerName}
                  </span>
                </span>

                <span className="expense__amount">{formattedAmount}</span>

                <button
                  ref={(node) => {
                    if (node) {
                      deleteButtonRefs.current.set(expense.id, node)
                    } else {
                      deleteButtonRefs.current.delete(expense.id)
                    }
                  }}
                  className="expense__delete"
                  type="button"
                  onClick={() => handleDelete(expense, index)}
                  aria-label={deleteLabel}
                  title={deleteLabel}
                >
                  <TrashIcon size={15} />
                  <span className="expense__delete-label">Delete</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
