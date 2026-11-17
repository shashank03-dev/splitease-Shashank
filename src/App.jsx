import ExpenseManager from './components/ExpenseManager'
import GroupManager from './components/GroupManager'
import Header from './components/Header'
import HandNote from './components/ui/HandNote'
import { useExpenses } from './hooks/useExpenses'
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

  const { expenses, canAddExpense, addExpense } = useExpenses(members)

  const memberCount = members.length
  const hasExpenses = expenses.length > 0

  let guide

  if (memberCount === 0) {
    guide = {
      target: 'group',
      kicker: 'Start here',
      copy: 'Add two people to unlock expenses.',
    }
  } else if (memberCount === 1) {
    guide = {
      target: 'group',
      kicker: 'One more',
      copy: 'Add a second person to unlock the expense form.',
    }
  } else if (!hasExpenses) {
    guide = {
      target: 'expenses',
      kicker: 'Next',
      copy: 'Log what it was, how much, and who paid.',
    }
  } else {
    guide = {
      target: 'expenses',
      kicker: 'Live totals',
      copy: 'Every entry updates the split below.',
    }
  }

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
              <span className="intro__title-accent">
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

          <div className="management-stack">
            <div className="card-block card-block--group">
              {guide.target === 'group' ? (
                <HandNote
                  kicker={guide.kicker}
                  className="hand-note--group"
                >
                  {guide.copy}
                </HandNote>
              ) : null}

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

            <div className="card-block card-block--expenses">
              {guide.target === 'expenses' ? (
                <HandNote
                  kicker={guide.kicker}
                  className="hand-note--expenses"
                >
                  {guide.copy}
                </HandNote>
              ) : null}

              <ExpenseManager
                members={members}
                expenses={expenses}
                canAddExpense={canAddExpense}
                onAddExpense={addExpense}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
