import { MAX_GROUP_SIZE, MIN_GROUP_SIZE } from '../utils/memberUtils'
import MemberForm from './MemberForm'
import MemberList from './MemberList'

export default function GroupManager({
  members,
  error,
  isAtLimit,
  remainingSlots,
  onAddMember,
  onRemoveMember,
  onClearError,
}) {
  const memberCount = members.length
  const isReady = memberCount >= MIN_GROUP_SIZE

  let statusLabel = 'Empty'
  if (memberCount === 1) statusLabel = '1 more needed'
  if (isReady) statusLabel = 'Ready'
  if (memberCount === MAX_GROUP_SIZE) statusLabel = 'Full'

  return (
    <section className="group-card" id="group" aria-labelledby="group-heading">
      <div className="group-card__header">
        <h2 id="group-heading">Group members</h2>

        <div className="group-card__aside">
          <span
            className="group-stat"
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
        onAddMember={onAddMember}
        onClearError={onClearError}
      />

      <div className="group-card__divider" />

      <MemberList members={members} onRemoveMember={onRemoveMember} />
    </section>
  )
}
