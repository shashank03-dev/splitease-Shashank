import { useId } from 'react'
import { BALANCE_STATUS } from '../utils/balanceUtils'
import { formatPaise } from '../utils/expenseUtils'
import { getInitials } from '../utils/memberUtils'

const STATUS_LABELS = {
  [BALANCE_STATUS.OWED]: 'Is owed',
  [BALANCE_STATUS.OWES]: 'Owes',
  [BALANCE_STATUS.SETTLED]: 'Settled',
}

const STATUS_MARKERS = {
  [BALANCE_STATUS.OWED]: '+',
  [BALANCE_STATUS.OWES]: '−',
  [BALANCE_STATUS.SETTLED]: '=',
}

export default function MemberBalances({ balances, memberCount }) {
  const headingId = useId()

  return (
    <section className="member-balances" aria-labelledby={headingId}>
      <div className="section-heading">
        <h3 id={headingId}>Member balances</h3>
        <span className="pill">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>
      </div>

      <ul className="balance-list" aria-label="Member balances">
        {balances.map((balance) => (
          <li
            className={`balance balance--${balance.status}`}
            key={balance.memberId}
          >
            <span className="avatar" aria-hidden="true">
              {getInitials(balance.name)}
            </span>

            <span className="balance__person">
              <span className="balance__name">{balance.name}</span>
              <span className="balance__contribution">
                Paid {formatPaise(balance.contributionPaise)} · share{' '}
                {formatPaise(balance.sharePaise)}
              </span>
            </span>

            <span className="balance__result">
              <span className="balance__status">
                {STATUS_LABELS[balance.status]}
              </span>
              <span className="balance__amount">
                <span className="balance__marker" aria-hidden="true">
                  {STATUS_MARKERS[balance.status]}
                </span>
                {formatPaise(Math.abs(balance.balancePaise))}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="balance-legend">
        Balance = total paid − equal share. Plus is owed, minus owes, equals
        settled.
      </p>
    </section>
  )
}
