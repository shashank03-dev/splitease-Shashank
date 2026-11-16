import { getInitials } from '../utils/memberUtils'
import { TrashIcon } from './ui/Icons'

export default function MemberList({ members, onRemoveMember }) {
  if (members.length === 0) {
    return null
  }

  return (
    <div className="member-list">
      <ul className="member-list__items" aria-label="Current group members">
        {members.map((member) => (
          <li className="member" key={member.id}>
            <span className="avatar" aria-hidden="true">
              {getInitials(member.name)}
            </span>

            <span className="member__name">{member.name}</span>

            <button
              className="icon-button"
              type="button"
              onClick={() => onRemoveMember(member.id)}
              aria-label={`Remove ${member.name} from the group`}
              title={`Remove ${member.name}`}
            >
              <TrashIcon size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
