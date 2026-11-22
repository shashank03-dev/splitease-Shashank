import { useRef } from 'react'
import { MAX_GROUP_SIZE, MIN_GROUP_SIZE } from '../utils/memberUtils'
import MemberForm from './MemberForm'
import MemberList from './MemberList'

export default function GroupManager({
  members,
  expenseCountsByMember,
  error,
  isAtLimit,
  remainingSlots,
  onAddMember,
  onRemoveMember,
  onClearError,
}) {
  const nameInputRef = useRef(null)
  const memberCount = members.length
  const isReady = memberCount >= MIN_GROUP_SIZE

  let statusLabel = 'Empty'
  if (memberCount === 1) statusLabel = '1 more needed'
  if (isReady) statusLabel = 'Ready'
  if (memberCount === MAX_GROUP_SIZE) statusLabel = 'Full'

  return (
    <section className="group-card" id="group" aria-labelledby="group-heading">
      <div className="card-header">
        <div className="card-header__titles">
          <span className="card-header__step">Step 1</span>
          <h2 id="group-heading">Group members</h2>
        </div>

        <div className="card-header__aside">
          <span
            className="card-stat"
            aria-live="polite"
            aria-atomic="true"
          >
            {memberCount}
            <span> / {MAX_GROUP_SIZE}</span>
          </span>
          <span className={`pill${isReady ? ' pill--success' : ''}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="capacity" aria-hidden="true">
        {Array.from({ length: MAX_GROUP_SIZE }, (_, index) => (
          <span
            className={`capacity__segment${
              index < memberCount ? ' is-filled' : ''
            }`}
            key={index}
          />
        ))}
      </div>

      <MemberForm
        memberCount={memberCount}
        error={error}
        isAtLimit={isAtLimit}
        remainingSlots={remainingSlots}
        inputRef={nameInputRef}
        onAddMember={onAddMember}
        onClearError={onClearError}
      />

      <div className="card-divider" />

      <MemberList
        members={members}
        expenseCountsByMember={expenseCountsByMember}
        nameInputRef={nameInputRef}
        onRemoveMember={onRemoveMember}
      />
    </section>
  )
}
