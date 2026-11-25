import { useId, useRef, useState } from 'react'
import { MAX_GROUP_SIZE, MAX_NAME_LENGTH } from '../utils/memberUtils'
import { AlertCircleIcon, PlusIcon } from './ui/Icons'

export default function MemberForm({
  memberCount,
  error,
  isAtLimit,
  remainingSlots,
  inputRef,
  isBusy = false,
  isAdding = false,
  onAddMember,
  onClearError,
}) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const localInputRef = useRef(null)
  const nameInputRef = inputRef ?? localInputRef
  const inputId = useId()
  const hintId = useId()
  const errorId = useId()

  const isFull = isAtLimit
  const isWorking = isAdding || isSubmitting
  const isDisabled = isFull || isBusy || isWorking
  const displayError = error || submitError
  const describedBy = [hintId, displayError ? errorId : null]
    .filter(Boolean)
    .join(' ')

  function handleChange(event) {
    setName(event.target.value)
    setSubmitError('')

    if (error) {
      onClearError()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isDisabled) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const result = await onAddMember(name)

      if (result?.ok) {
        setName('')
        setSubmitError('')

        if (memberCount + 1 < MAX_GROUP_SIZE) {
          nameInputRef.current?.focus()
        }

        return
      }

      // The hook also stores the message; this local copy makes the error
      // visible immediately if a parent render is delayed.
      setSubmitError(result?.message || 'Could not add this person.')
      nameInputRef.current?.focus()
    } catch {
      setSubmitError(
        'Could not add this person. Check the API connection and try again.',
      )
      nameInputRef.current?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  let placeholder = 'e.g. Aman, Riya'
  let buttonLabel = 'Add'

  if (isFull) {
    placeholder = 'Group is full'
    buttonLabel = 'Full'
  } else if (isBusy) {
    placeholder = 'Connecting to the API…'
  } else if (isWorking) {
    buttonLabel = 'Adding…'
  }

  const hint = isBusy
    ? 'Waiting for the API before accepting new names.'
    : `Unique names, up to ${MAX_NAME_LENGTH} characters`

  return (
    <form
      className="member-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isWorking}
    >
      <label className="field-label" htmlFor={inputId}>
        Name
      </label>

      <div className="member-form__row">
        <input
          ref={nameInputRef}
          id={inputId}
          className={`text-input${displayError ? ' text-input--error' : ''}`}
          type="text"
          name="memberName"
          value={name}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="words"
          spellCheck="false"
          maxLength={MAX_NAME_LENGTH}
          required
          disabled={isDisabled}
          aria-required="true"
          aria-invalid={Boolean(displayError)}
          aria-describedby={describedBy}
        />

        <button
          className="button button--primary"
          type="submit"
          disabled={isDisabled}
        >
          {isFull || isBusy || isWorking ? null : <PlusIcon size={16} />}
          {buttonLabel}
        </button>
      </div>

      <div className="member-form__meta">
        <p id={hintId} className="field-hint">
          {hint}
        </p>
        <span className={`spots${isFull ? ' spots--full' : ''}`}>
          {isFull
            ? 'No spots left'
            : `${remainingSlots} ${remainingSlots === 1 ? 'spot' : 'spots'} left`}
        </span>
      </div>

      {displayError ? (
        <p className="field-error" id={errorId} role="alert">
          <AlertCircleIcon size={15} />
          <span>{displayError}</span>
        </p>
      ) : null}

      {isFull && !displayError ? (
        <p className="field-note">Remove a member to add another.</p>
      ) : null}
    </form>
  )
}
