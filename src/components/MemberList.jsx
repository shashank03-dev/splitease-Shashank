import { MAX_GROUP_SIZE, getInitials } from '../utils/memberUtils'
import EmptyState from './ui/EmptyState'
import { TrashIcon } from './ui/Icons'

export default function MemberList({ members, onRemoveMember }) {
  return (
    <div className="member-list">
      <div className="member-list__header">
        <div className="member-list__heading">
          <h3>Members</h3>
          <p className="member-list__note">Refreshing clears the group.</p>
        </div>
        <span className="member-list__count">
          {members.length} / {MAX_GROUP_SIZE}
        </span>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title="No one added yet"
          description="Add the first person above."
        />
      ) : (
        <ul className="member-list__items">
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
      )}
    </div>
  )
}
