import { AlertCircleIcon } from './ui/Icons'

/**
 * Inline loading or unavailable state used inside a card. Keeping it next to
 * the section it describes is clearer than showing an empty group while the
 * API request is still in flight.
 */
export default function DataState({
  status = 'loading',
  title,
  message,
  onRetry,
  isRetrying = false,
}) {
  const isLoading = status === 'loading'

  return (
    <div
      className={`data-state${isLoading ? '' : ' data-state--error'}`}
      role="status"
      aria-live="polite"
    >
      {isLoading ? (
        <span className="data-state__spinner" aria-hidden="true" />
      ) : (
        <AlertCircleIcon className="data-state__icon" size={18} />
      )}

      <div className="data-state__body">
        <p className="data-state__title">{title}</p>
        {message ? <p className="data-state__copy">{message}</p> : null}

        {onRetry ? (
          <button
            className="data-state__retry"
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? 'Retrying…' : 'Try again'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
