import { useId } from 'react'
import { formatPaise } from '../utils/expenseUtils'

function joinNames(names) {
  if (names.length === 0) {
    return 'the first members'
  }

  if (names.length === 1) {
    return names[0]
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`
  }

  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export default function ExpenseSummary({ summary }) {
  const headingId = useId()
  const {
    totalPaise,
    memberCount,
    expenseCount,
    canSplit,
    equalShare,
    balances,
    hasFormerPayerExpenses,
    unattributedPaise,
  } = summary

  const equalShareValue = canSplit
    ? formatPaise(equalShare.basePaise)
    : '\u2014'

  const notes = []

  if (!canSplit) {
    notes.push(
      memberCount === 0
        ? 'Add group members to start splitting.'
        : 'Add one more member to unlock an equal split.',
    )
  } else if (expenseCount === 0) {
    notes.push('No expenses yet. Every member is settled at ₹0.00.')
  } else if (equalShare.isEven) {
    notes.push(`Split equally between ${memberCount} people.`)
  } else {
    const extraPaiseRecipients = balances
      .slice(0, equalShare.remainderPaise)
      .map((balance) => balance.name)

    notes.push(
      `${formatPaise(totalPaise)} ÷ ${memberCount} people does not divide into whole paise.`,
      `The base share is ${formatPaise(
        equalShare.basePaise,
      )}; ${formatPaise(equalShare.remainderPaise)} extra is assigned to ${joinNames(
        extraPaiseRecipients,
      )}.`,
    )
  }

  if (hasFormerPayerExpenses) {
    notes.push(
      `${formatPaise(
        unattributedPaise,
      )} was paid by someone no longer in the group, so that contribution is not shown below.`,
    )
  }

  return (
    <section
      className="expense-summary"
      aria-labelledby={headingId}
    >
      <div className="section-heading">
        <h3 id={headingId}>Split summary</h3>
        <span className="pill">Equal split</span>
      </div>

      <dl
        className="summary-metrics"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="summary-metric">
          <dt>Total spent</dt>
          <dd>{formatPaise(totalPaise)}</dd>
        </div>

        <div className="summary-metric">
          <dt>Equal share</dt>
          <dd>{equalShareValue}</dd>
        </div>

        <div className="summary-metric">
          <dt>Group size</dt>
          <dd>
            {memberCount}
            <span>{memberCount === 1 ? ' person' : ' people'}</span>
          </dd>
        </div>
      </dl>

      <p className="summary-note">{notes.join(' ')}</p>
    </section>
  )
}
