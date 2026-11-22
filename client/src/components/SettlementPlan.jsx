import { useEffect, useId, useRef, useState } from 'react'
import { formatPaise } from '../utils/expenseUtils'
import { getInitials } from '../utils/memberUtils'
import { CheckIcon } from './ui/Icons'

function PaymentArrow({ amountPaise }) {
  return (
    <span className="settlement__connector" aria-hidden="true">
      <svg
        className="settlement__arrow"
        viewBox="0 0 160 50"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="settlement__stroke settlement__stroke--echo"
          pathLength="1"
          d="M9 41c21-12 42-15 62-8s38 5 58-3"
        />
        <path
          className="settlement__stroke settlement__stroke--main"
          pathLength="1"
          d="M5 32C28 12 58 10 84 22c20 8 42 8 63-2"
        />
        <path
          className="settlement__stroke settlement__stroke--head"
          pathLength="1"
          d="M133 10c5 3 10 6 16 9-6 3-11 7-14 13"
        />
        <path
          className="settlement__stroke settlement__stroke--echo settlement__stroke--echo-short"
          pathLength="1"
          d="M16 37c15-7 30-7 45-2"
        />
      </svg>

      <span className="settlement__amount">{formatPaise(amountPaise)}</span>
    </span>
  )
}

export default function SettlementPlan({ settlements }) {
  const headingId = useId()
  const sectionRef = useRef(null)
  const [isDrawn, setIsDrawn] = useState(false)
  const hasPayments = settlements.length > 0
  const paymentLabel = `${settlements.length} ${
    settlements.length === 1 ? 'payment' : 'payments'
  }`

  /**
   * Draw the arrows when the plan is actually on screen. Running the stroke
   * animation on mount would finish while the section was still below the fold.
   */
  useEffect(() => {
    if (!hasPayments) {
      return undefined
    }

    const node = sectionRef.current

    if (!node) {
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setIsDrawn(true))

      return () => window.cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsDrawn(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [hasPayments])

  return (
    <section
      className={`settlements${isDrawn ? ' settlements--drawn' : ''}`}
      ref={sectionRef}
      aria-labelledby={headingId}
    >
      <div className="section-heading">
        <h3 id={headingId}>Who pays whom</h3>
        <span className={`pill${hasPayments ? '' : ' pill--settled'}`}>
          {hasPayments ? paymentLabel : 'All settled'}
        </span>
      </div>

      {hasPayments ? (
        <>
          <ul className="settlement-list" aria-label="Suggested payments">
            {settlements.map((settlement, index) => {
              const amount = formatPaise(settlement.amountPaise)

              return (
                <li
                  className="settlement"
                  key={`${settlement.fromId}-${settlement.toId}-${settlement.amountPaise}`}
                  style={{ '--settlement-index': index }}
                >
                  <span className="sr-only">
                    {settlement.fromName} pays {settlement.toName} {amount}
                  </span>

                  <span className="settlement__visual" aria-hidden="true">
                    <span className="settlement__person settlement__person--from">
                      <span className="avatar">
                        {getInitials(settlement.fromName)}
                      </span>
                      <span className="settlement__identity">
                        <span className="settlement__name">
                          {settlement.fromName}
                        </span>
                        <span className="settlement__role">Pays</span>
                      </span>
                    </span>

                    <PaymentArrow amountPaise={settlement.amountPaise} />

                    <span className="settlement__person settlement__person--to">
                      <span className="settlement__identity">
                        <span className="settlement__name">
                          {settlement.toName}
                        </span>
                        <span className="settlement__role">Receives</span>
                      </span>
                      <span className="avatar">
                        {getInitials(settlement.toName)}
                      </span>
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="settlement-note">
            Each arrow is one payment. Clear these and every balance returns to
            zero.
          </p>
        </>
      ) : (
        <div className="settlements__settled" role="status">
          <span className="settlements__settled-icon">
            <CheckIcon size={17} />
          </span>
          <span>
            <span className="settlements__settled-title">
              Everyone is settled up
            </span>
            <span className="settlements__settled-copy">
              No payments are needed right now.
            </span>
          </span>
        </div>
      )}
    </section>
  )
}
