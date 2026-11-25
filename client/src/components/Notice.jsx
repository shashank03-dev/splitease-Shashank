import {
  AlertCircleIcon,
  InfoIcon,
  XIcon,
} from './ui/Icons'

/**
 * Page-level feedback banner. It keeps the Week 1 notice styling while adding
 * an optional retry action for API failures.
 */
export default function Notice({
  message,
  tone = 'info',
  onDismiss,
  onRetry,
  retryLabel = 'Retry',
  isRetrying = false,
}) {
  if (!message) {
    return null
  }

  const isDanger = tone === 'danger'
  const Icon = isDanger ? AlertCircleIcon : InfoIcon

  return (
    <div
      className={`notice${isDanger ? ' notice--danger' : ''}`}
      role={isDanger ? 'alert' : 'status'}
    >
      <Icon className="notice__icon" size={18} />
      <p>{message}</p>

      <div className="notice__actions">
        {onRetry ? (
          <button
            className="notice__retry"
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? 'Retrying…' : retryLabel}
          </button>
        ) : null}

        {onDismiss ? (
          <button
            className="notice__dismiss"
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notice"
            title="Dismiss"
          >
            <XIcon size={16} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
