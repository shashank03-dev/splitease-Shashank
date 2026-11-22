import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import ExpenseManager from './components/ExpenseManager'
import GroupManager from './components/GroupManager'
import Header from './components/Header'
import StorageNotice from './components/StorageNotice'
import HandNote from './components/ui/HandNote'
import { AlertCircleIcon, LockIcon } from './components/ui/Icons'
import { useExpenses } from './hooks/useExpenses'
import { useGroupMembers } from './hooks/useGroupMembers'
import {
  dismissStorageStatusMessage,
  getStorageStatus,
  readSplitState,
  subscribeToStorageStatus,
  writeSplitState,
} from './utils/storage'

export default function App() {
  const [initialState] = useState(() => readSplitState())
  const [loadNotice, setLoadNotice] = useState(initialState.notice)
  const saveStatus = useSyncExternalStore(
    subscribeToStorageStatus,
    getStorageStatus,
    getStorageStatus,
  )

  const {
    members,
    error,
    addMember,
    removeMember,
    clearError,
    isAtLimit,
    remainingSlots,
  } = useGroupMembers(initialState.members)

  const { expenses, canAddExpense, addExpense, removeExpense } = useExpenses(
    members,
    initialState.expenses,
  )

  /**
   * Persistence is a side effect, not part of rendering. This runs after React
   * has committed every member or expense change, so storage always receives
   * the same arrays the screen is showing. Save failures are published through
   * the storage status store instead of scheduling React state from this effect.
   */
  useEffect(() => {
    writeSplitState({ members, expenses })
  }, [members, expenses])

  const expenseCountsByMember = new Map()

  expenses.forEach((expense) => {
    expenseCountsByMember.set(
      expense.payerId,
      (expenseCountsByMember.get(expense.payerId) ?? 0) + 1,
    )
  })

  /**
   * Referential integrity: an expense must always point at a current member.
   * Blocking removal is safer than silently deleting financial history.
   */
  const handleRemoveMember = useCallback(
    (memberId) => {
      const member = members.find((entry) => entry.id === memberId)

      if (!member) {
        return { ok: false }
      }

      const linkedExpenseCount = expenses.filter(
        (expense) => expense.payerId === memberId,
      ).length

      if (linkedExpenseCount > 0) {
        return { ok: false, code: 'linked-expenses' }
      }

      removeMember(memberId)
      return { ok: true }
    },
    [expenses, members, removeMember],
  )

  function handleDismissNotice() {
    dismissStorageStatusMessage()
    setLoadNotice('')
  }

  const storageAvailable = initialState.storageAvailable && saveStatus.available
  const noticeMessage = saveStatus.message || loadNotice
  const noticeTone = saveStatus.message ? 'danger' : 'info'
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
      copy: 'Delete any entry and every total updates instantly.',
    }
  }

  return (
    <div className="app-shell" id="top">
      <a className="skip-link" href="#group">
        Skip to group setup
      </a>

      <Header />

      <main className="container main" id="main-content">
        <StorageNotice
          message={noticeMessage}
          tone={noticeTone}
          onDismiss={handleDismissNotice}
        />

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
                expenseCountsByMember={expenseCountsByMember}
                error={error}
                isAtLimit={isAtLimit}
                remainingSlots={remainingSlots}
                onAddMember={addMember}
                onRemoveMember={handleRemoveMember}
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
                onDeleteExpense={removeExpense}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p
            className={`site-footer__note${
              storageAvailable ? '' : ' site-footer__note--danger'
            }`}
          >
            {storageAvailable ? (
              <LockIcon size={14} />
            ) : (
              <AlertCircleIcon size={14} />
            )}
            {storageAvailable
              ? 'Saved locally in this browser — no account, no server.'
              : 'Changes are not being saved in this browser.'}
          </p>
          <p className="site-footer__meta">SplitEasy · equal splits, clearly.</p>
        </div>
      </footer>
    </div>
  )
}
