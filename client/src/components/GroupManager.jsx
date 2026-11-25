import { useRef } from 'react'
import { MAX_GROUP_SIZE, MIN_GROUP_SIZE } from '../utils/memberUtils'
import DataState from './DataState'
import MemberForm from './MemberForm'
import MemberList from './MemberList'

export default function GroupManager({
  members,
  expenseCountsByMember,
  error,
  isAtLimit,
  remainingSlots,
  isLoading,
  hasLoaded,
  loadError,
  isAdding,
  removingId,
  isUnavailable,
  onAddMember,
  onRemoveMember,
  onClearError,
  onRetry,
}) {
  const nameInputRef = useRef(null)
  const memberCount = members.length
  const isReady = memberCount >= MIN_GROUP_SIZE
  const showInitialLoading = isLoading && !hasLoaded

  let statusLabel = 'Empty'
  if (showInitialLoading) statusLabel = 'Loading'
  else if (isUnavailable) statusLabel = 'Offline'
  else if (memberCount === MAX_GROUP_SIZE) statusLabel = 'Full'
  else if (isReady) statusLabel = 'Ready'
  else if (memberCount === 1) statusLabel = '1 more needed'

  return (
    <section
      className="group-card"
      id="group"
      aria-labelledby="group-heading"
      aria-busy={showInitialLoading || isAdding || Boolean(removingId)}
    >
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
            {hasLoaded ? memberCount : '—'}
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
        isBusy={showInitialLoading || isUnavailable || Boolean(removingId)}
        isAdding={isAdding}
        onAddMember={onAddMember}
        onClearError={onClearError}
      />

      <div className="card-divider" />

      {showInitialLoading ? (
        <DataState
          status="loading"
          title="Loading group members…"
          message="Fetching your saved people from the SplitEasy API."
        />
      ) : isUnavailable ? (
        <DataState
          status="error"
          title="Group members could not be loaded."
          message={loadError}
          onRetry={onRetry}
        />
      ) : (
        <MemberList
          members={members}
          expenseCountsByMember={expenseCountsByMember}
          removingId={removingId}
          nameInputRef={nameInputRef}
          onRemoveMember={onRemoveMember}
        />
      )}
    </section>
  )
}
