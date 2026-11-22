export default function HandNote({ kicker, children, className = '' }) {
  return (
    <aside className={`hand-note ${className}`.trim()} role="note">
      <span className="hand-note__kicker">{kicker}</span>
      <p className="hand-note__copy">{children}</p>

      <svg
        className="hand-note__arrow hand-note__arrow--side"
        viewBox="0 0 120 48"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="hand-note__stroke"
          d="M4 33c17-16 33-19 49-11 16 8 33 7 56-8"
        />
        <path
          className="hand-note__stroke"
          d="M98 5c4 5 8 8 13 10-5 3-9 7-12 12"
        />
        <path
          className="hand-note__stroke hand-note__stroke--echo"
          d="M8 39c16-9 31-10 46-4"
        />
      </svg>

      <svg
        className="hand-note__arrow hand-note__arrow--down"
        viewBox="0 0 60 72"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="hand-note__stroke"
          d="M30 3c-5 15-7 29-4 45 1 6 5 11 10 16"
        />
        <path
          className="hand-note__stroke"
          d="M24 55c4 4 8 8 12 13 1-6 4-11 8-15"
        />
        <path
          className="hand-note__stroke hand-note__stroke--echo"
          d="M21 8c-3 12-4 24-2 36"
        />
      </svg>
    </aside>
  )
}
