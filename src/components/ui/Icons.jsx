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

export function ChevronDownIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </SvgIcon>
  )
}
