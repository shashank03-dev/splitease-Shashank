import { useCallback, useState } from 'react'
import { MAX_GROUP_SIZE, validateMemberName } from '../utils/memberUtils'
import { createMemberId } from '../utils/id'

/**
 * Owns all group-member state and rules.
 *
 * Keeping this logic in one custom hook means the UI components stay
 * presentational, and the expense and persistence layers can read the same
 * validated member list without duplicating rules.
 */
export function useGroupMembers(initialMembers = []) {
  const [members, setMembers] = useState(initialMembers)
  const [error, setError] = useState('')

  const addMember = useCallback(
    (rawName) => {
      if (members.length >= MAX_GROUP_SIZE) {
        const message = 'Group is full. Remove a member to add another.'
        setError(message)
        return { ok: false, message }
      }

      const validation = validateMemberName(rawName, members)

      if (!validation.ok) {
        setError(validation.message)
        return validation
      }

      setMembers((currentMembers) => [
        ...currentMembers,
        { id: createMemberId(), name: validation.name },
      ])
      setError('')

      return { ok: true, name: validation.name }
    },
    [members],
  )

  const removeMember = useCallback((memberId) => {
    setMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== memberId),
    )
    setError('')
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const memberCount = members.length

  return {
    members,
    error,
    addMember,
    removeMember,
    clearError,
    isAtLimit: memberCount >= MAX_GROUP_SIZE,
    remainingSlots: Math.max(MAX_GROUP_SIZE - memberCount, 0),
  }
}
