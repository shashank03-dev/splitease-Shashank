function SvgIcon({ size = 20, className, children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function LogoMark({ size = 24, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16.8 7.3c-1-.9-2.4-1.4-4-1.4-2.7 0-4.5 1.3-4.5 3.2 0 2.1 2 2.8 4.4 3.3 2.7.6 4.7 1.4 4.7 3.6 0 2.2-1.9 3.7-4.9 3.7-2.2 0-4.1-.8-5.3-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="19.2" cy="4.8" r="1.6" fill="#b33f22" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </SvgIcon>
  )
}

export function TrashIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="m6 7 .8 12.1A2 2 0 0 0 8.8 21h6.4a2 2 0 0 0 2-1.9L18 7" />
      <path d="M10 11v6M14 11v6" />
    </SvgIcon>
  )
}

export function AlertCircleIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" />
    </SvgIcon>
  )
}

export function CheckIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m5 12.5 4.2 4L19 6.5" />
    </SvgIcon>
  )
}

export function ChevronDownIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </SvgIcon>
  )
}

export function XIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </SvgIcon>
  )
}

export function InfoIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.5h.01" />
    </SvgIcon>
  )
}

export function LockIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </SvgIcon>
  )
}

export function UsersIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M18 20v-1.5a4 4 0 0 0-3-3.87" />
      <path d="M15.5 4.2a3.2 3.2 0 0 1 0 5.6" />
    </SvgIcon>
  )
}

export function ReceiptIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 0 1 1-1Z" />
      <path d="M9 8h6M9 12h6" />
    </SvgIcon>
  )
}
