export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h4 className="empty-state__title">{title}</h4>
      <p className="empty-state__description">{description}</p>
    </div>
  )
}
