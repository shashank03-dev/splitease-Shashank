import { useEffect, useRef, useState } from 'react'
import { getInitials } from '../utils/memberUtils'
import { AlertCircleIcon, TrashIcon, UsersIcon } from './ui/Icons'

export default function MemberList({
  members,
  expenseCountsByMember = new Map(),
  nameInputRef,
  onRemoveMember,
}) {
  const [blockedMemberId, setBlockedMemberId] = useState(null)
  const removeButtonRefs = useRef(new Map())
  const pendingFocusRef = useRef(null)

  /**
   * Deleting a focused button would otherwise drop keyboard focus onto the
   * document body. After the list commits, move focus to the next row's remove
   * button, or back to the name field when the list is empty.
   */
  useEffect(() => {
    const target = pendingFocusRef.current

    if (!target) {
      return
    }

    pendingFocusRef.current = null

    if (target === 'input') {
      nameInputRef.current?.focus()
      return
    }

    removeButtonRefs.current.get(target)?.focus()
  }, [members, nameInputRef])

  function handleRemove(member, index) {
    const remaining = members.filter((entry) => entry.id !== member.id)
    const nextMember = remaining[index] ?? remaining[index - 1] ?? null
    const result = onRemoveMember(member.id)

    if (!result?.ok) {
      if (result?.code === 'linked-expenses') {
        setBlockedMemberId(member.id)
      }
      return
    }

    setBlockedMemberId(null)
    pendingFocusRef.current = nextMember ? nextMember.id : 'input'
  }

  if (members.length === 0) {
    return (
      <div className="member-list member-list--empty">
        <div className="empty-state">
          <UsersIcon className="empty-state__icon" size={20} />
          <div>
            <p className="empty-state__title">No one here yet</p>
            <p className="empty-state__copy">
              Add at least two people above to unlock equal splitting.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="member-list">
      <ul className="member-list__items" aria-label="Current group members">
        {members.map((member, index) => {
          const linkedExpenseCount = expenseCountsByMember.get(member.id) ?? 0
          const showBlockedError =
            blockedMemberId === member.id && linkedExpenseCount > 0
          const errorId = `member-error-${member.id}`
          const removeLabel =
            linkedExpenseCount > 0
              ? `Remove ${member.name} — delete ${linkedExpenseCount} linked ${
                  linkedExpenseCount === 1 ? 'expense' : 'expenses'
                } first`
              : `Remove ${member.name} from the group`

          return (
            <li className="member-item" key={member.id}>
              <div className="member">
                <span className="avatar" aria-hidden="true">
                  {getInitials(member.name)}
                </span>

                <span className="member__person">
                  <span className="member__name">{member.name}</span>
                  {linkedExpenseCount > 0 ? (
                    <span className="member__meta">
                      {linkedExpenseCount}{' '}
                      {linkedExpenseCount === 1 ? 'expense' : 'expenses'} linked
                    </span>
                  ) : null}
                </span>

                <button
                  ref={(node) => {
                    if (node) {
                      removeButtonRefs.current.set(member.id, node)
                    } else {
                      removeButtonRefs.current.delete(member.id)
                    }
                  }}
                  className="icon-button"
                  type="button"
                  onClick={() => handleRemove(member, index)}
                  aria-label={removeLabel}
                  aria-describedby={showBlockedError ? errorId : undefined}
                  title={removeLabel}
                >
                  <TrashIcon size={16} />
                </button>
              </div>

              {showBlockedError ? (
                <p className="field-error member-error" id={errorId} role="alert">
                  <AlertCircleIcon size={15} />
                  <span>
                    {member.name} paid for {linkedExpenseCount}{' '}
                    {linkedExpenseCount === 1 ? 'expense' : 'expenses'}. Delete{' '}
                    {linkedExpenseCount === 1
                      ? 'that expense'
                      : 'those expenses'}{' '}
                    before removing this member.
                  </span>
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
