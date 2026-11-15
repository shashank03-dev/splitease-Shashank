import { useId, useRef, useState } from 'react'
import { MAX_GROUP_SIZE, MAX_NAME_LENGTH } from '../utils/memberUtils'
import { AlertCircleIcon, PlusIcon } from './ui/Icons'

export default function MemberForm({
  memberCount,
  error,
  isAtLimit,
  remainingSlots,
  onAddMember,
  onClearError,
}) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)
  const inputId = useId()
  const hintId = useId()
  const errorId = useId()

  const isFull = isAtLimit
  const describedBy = [hintId, error ? errorId : null].filter(Boolean).join(' ')

  function handleChange(event) {
    setName(event.target.value)

    if (error) {
      onClearError()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const result = onAddMember(name)

    if (result.ok) {
      setName('')

      if (memberCount + 1 < MAX_GROUP_SIZE) {
        inputRef.current?.focus()
      }
    }
  }

  return (
    <form className="member-form" onSubmit={handleSubmit} noValidate>
      <label className="field-label" htmlFor={inputId}>
        Name
      </label>

      <div className="member-form__row">
        <input
          ref={inputRef}
          id={inputId}
          className={`text-input${error ? ' text-input--error' : ''}`}
          type="text"
          name="memberName"
          value={name}
          onChange={handleChange}
          placeholder={isFull ? 'Group is full' : 'e.g. Aman, Riya'}
          autoComplete="off"
          maxLength={MAX_NAME_LENGTH}
          disabled={isFull}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />

        <button
          className="button button--primary"
          type="submit"
          disabled={isFull}
        >
          {isFull ? null : <PlusIcon size={16} />}
          {isFull ? 'Full' : 'Add'}
        </button>
      </div>

      <div className="member-form__meta">
        <p id={hintId} className="field-hint">
          Unique names, up to {MAX_NAME_LENGTH} characters
        </p>
        <span className={`spots${isFull ? ' spots--full' : ''}`}>
          {isFull
            ? 'No spots left'
            : `${remainingSlots} ${remainingSlots === 1 ? 'spot' : 'spots'} left`}
        </span>
      </div>

      {error ? (
        <p className="field-error" id={errorId} role="alert">
          <AlertCircleIcon size={15} />
          <span>{error}</span>
        </p>
      ) : null}

      {isFull && !error ? (
        <p className="field-note">Remove a member to add another.</p>
      ) : null}
    </form>
  )
}
