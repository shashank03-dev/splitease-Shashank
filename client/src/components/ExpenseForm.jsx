import { useId, useRef, useState } from 'react'
import { MAX_EXPENSE_DESCRIPTION_LENGTH } from '../utils/expenseUtils'
import {
  AlertCircleIcon,
  ChevronDownIcon,
  PlusIcon,
} from './ui/Icons'

export default function ExpenseForm({
  members,
  canAddExpense,
  isBusy = false,
  isAdding = false,
  onAddExpense,
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const descriptionRef = useRef(null)
  const amountRef = useRef(null)
  const payerRef = useRef(null)
  const descriptionId = useId()
  const amountId = useId()
  const payerFieldId = useId()
  const hintId = useId()
  const errorId = useId()

  const selectedPayerId = members.some((member) => member.id === payerId)
    ? payerId
    : ''
  const isWorking = isAdding || isSubmitting
  const isDisabled = !canAddExpense || isBusy || isWorking

  function clearError() {
    if (error) {
      setError(null)
    }
  }

  function focusField(field) {
    if (field === 'amount') {
      amountRef.current?.focus()
      return
    }

    if (field === 'payerId') {
      payerRef.current?.focus()
      return
    }

    descriptionRef.current?.focus()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isDisabled) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await onAddExpense({
        description,
        amount,
        payerId: selectedPayerId,
      })

      if (result?.ok) {
        setDescription('')
        setAmount('')
        setPayerId('')
        setError(null)
        descriptionRef.current?.focus()
        return
      }

      setError({
        field: result?.field ?? 'form',
        message: result?.message || 'Could not add this expense.',
      })
      focusField(result?.field)
    } catch {
      setError({
        field: 'form',
        message:
          'Could not add this expense. Check the API connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const errorIdFor = (field) => (error?.field === field ? errorId : undefined)
  const amountDescribedBy =
    [hintId, errorIdFor('amount')].filter(Boolean).join(' ') || undefined

  let hint = 'Amounts support up to two decimals.'

  if (isBusy) {
    hint = 'Waiting for the API before accepting expenses.'
  } else if (!canAddExpense) {
    hint = 'Add two members to start logging expenses.'
  }

  let buttonLabel = 'Add'
  if (!canAddExpense) {
    buttonLabel = 'Locked'
  } else if (isWorking) {
    buttonLabel = 'Adding…'
  }

  return (
    <form
      className="expense-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isWorking}
    >
      <div className="expense-form__grid">
        <div className="expense-form__field expense-form__field--description">
          <label className="field-label" htmlFor={descriptionId}>
            Description
          </label>
          <input
            ref={descriptionRef}
            id={descriptionId}
            className={`text-input${
              error?.field === 'description' ? ' text-input--error' : ''
            }`}
            type="text"
            name="expenseDescription"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              clearError()
            }}
            placeholder="e.g. Dinner"
            autoComplete="off"
            maxLength={MAX_EXPENSE_DESCRIPTION_LENGTH}
            required
            disabled={isDisabled}
            aria-required="true"
            aria-invalid={error?.field === 'description' || undefined}
            aria-describedby={errorIdFor('description')}
          />
        </div>

        <div className="expense-form__field expense-form__field--amount">
          <label className="field-label" htmlFor={amountId}>
            Amount (₹)
          </label>
          <input
            ref={amountRef}
            id={amountId}
            className={`text-input${
              error?.field === 'amount' ? ' text-input--error' : ''
            }`}
            type="text"
            name="expenseAmount"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              clearError()
            }}
            placeholder="0.00"
            inputMode="decimal"
            autoComplete="off"
            required
            disabled={isDisabled}
            aria-required="true"
            aria-invalid={error?.field === 'amount' || undefined}
            aria-describedby={amountDescribedBy}
          />
        </div>

        <div className="expense-form__field">
          <label className="field-label" htmlFor={payerFieldId}>
            Paid by
          </label>
          <div className="select-wrap">
            <select
              ref={payerRef}
              id={payerFieldId}
              className={`text-input select-input${
                error?.field === 'payerId' ? ' text-input--error' : ''
              }`}
              name="expensePayer"
              value={selectedPayerId}
              onChange={(event) => {
                setPayerId(event.target.value)
                clearError()
              }}
              required
              disabled={isDisabled}
              aria-required="true"
              aria-invalid={error?.field === 'payerId' || undefined}
              aria-describedby={errorIdFor('payerId')}
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="select-wrap__icon"
              size={16}
            />
          </div>
        </div>

        <button
          className="button button--primary expense-form__submit"
          type="submit"
          disabled={isDisabled}
        >
          {canAddExpense && !isWorking ? <PlusIcon size={16} /> : null}
          {buttonLabel}
        </button>
      </div>

      <div className="expense-form__meta">
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      </div>

      {error ? (
        <p className="field-error" id={errorId} role="alert">
          <AlertCircleIcon size={15} />
          <span>{error.message}</span>
        </p>
      ) : null}
    </form>
  )
}
