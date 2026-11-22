import { AlertCircleIcon, InfoIcon, XIcon } from './ui/Icons'

export default function StorageNotice({ message, tone = 'info', onDismiss }) {
  if (!message) {
    return null
  }

  const isDanger = tone === 'danger'
  const Icon = isDanger ? AlertCircleIcon : InfoIcon

  return (
    <div
      className={`storage-notice${
        isDanger ? ' storage-notice--danger' : ''
      }`}
      role={isDanger ? 'alert' : 'status'}
    >
      <Icon className="storage-notice__icon" size={18} />
      <p>{message}</p>
      <button
        className="storage-notice__dismiss"
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss storage notice"
        title="Dismiss"
      >
        <XIcon size={16} />
      </button>
    </div>
  )
}
