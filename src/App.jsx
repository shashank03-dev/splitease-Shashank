import GroupManager from './components/GroupManager'
import Header from './components/Header'
import { useGroupMembers } from './hooks/useGroupMembers'

export default function App() {
  const {
    members,
    error,
    addMember,
    removeMember,
    clearError,
    isAtLimit,
    remainingSlots,
  } = useGroupMembers()

  return (
    <div className="app-shell" id="top">
      <a className="skip-link" href="#group">
        Skip to group setup
      </a>

      <Header />

      <main className="container main">
        <div className="intro-grid">
          <section className="intro" id="rules" aria-labelledby="page-heading">
            <h1 className="intro__title" id="page-heading">
              <span className="intro__title-sans">Let&rsquo;s</span>
              <span className="intro__title-serif">
                <span className="intro__title-big">split</span>{' '}
                <span className="intro__title-small">among.</span>
              </span>
            </h1>

            <p className="intro__copy">
              Add two to six people you split expenses with.
              <br />
              Go on, split wisely.
            </p>
          </section>

          <GroupManager
            members={members}
            error={error}
            isAtLimit={isAtLimit}
            remainingSlots={remainingSlots}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onClearError={clearError}
          />
        </div>
      </main>
    </div>
  )
}
