import { useCallback, useMemo, useState } from 'react'
import ExpenseManager from './components/ExpenseManager'
import GroupManager from './components/GroupManager'
import Header from './components/Header'
import Notice from './components/Notice'
import HandNote from './components/ui/HandNote'
import {
  AlertCircleIcon,
  CheckIcon,
  InfoIcon,
} from './components/ui/Icons'
import { useExpenses } from './hooks/useExpenses'
import { usePeople } from './hooks/usePeople'
import { withPayerNames } from './utils/apiMappers'
import { MAX_GROUP_SIZE } from './utils/memberUtils'

export default function App() {
  const {
    people,
    isLoading: isPeopleLoading,
    hasLoaded: hasLoadedPeople,
    loadError: peopleLoadError,
    error: memberError,
    isAdding: isAddingMember,
    removingId,
    addPerson,
    removePerson,
    clearError,
    retry: retryPeople,
  } = usePeople()

  const {
    expenses: apiExpenses,
    canAddExpense,
    isLoading: isExpensesLoading,
    hasLoaded: hasLoadedExpenses,
    loadError: expensesLoadError,
    isAdding: isAddingExpense,
    deletingId,
    addExpense,
    removeExpense,
    retry: retryExpenses,
    refresh: refreshExpenses,
  } = useExpenses(people)

  /**
   * The API stores only paidBy. Names are joined from the loaded people list
   * for display, so the two collections never keep conflicting copies.
   */
  const expenses = useMemo(
    () => withPayerNames(apiExpenses, people),
    [apiExpenses, people],
  )

  const [dismissedMessage, setDismissedMessage] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)

  const loadErrors = useMemo(
    () =>
      [...new Set([peopleLoadError, expensesLoadError].filter(Boolean))],
    [expensesLoadError, peopleLoadError],
  )
  const noticeMessage = loadErrors.join(' ')
  const showNotice =
    noticeMessage !== '' && dismissedMessage !== noticeMessage
  const isLoading = isPeopleLoading || isExpensesLoading
  const hasApiError = loadErrors.length > 0
  const isPeopleUnavailable = Boolean(peopleLoadError) && !hasLoadedPeople
  const isExpensesUnavailable =
    Boolean(expensesLoadError) && !hasLoadedExpenses
  const isExpenseDataUnavailable =
    isPeopleUnavailable || isExpensesUnavailable
  const hasLoadedExpenseData = hasLoadedPeople && hasLoadedExpenses
  const isExpenseDataLoading = isPeopleLoading || isExpensesLoading
  const expenseDataError = expensesLoadError || peopleLoadError

  const expenseCountsByMember = useMemo(() => {
    const counts = new Map()

    expenses.forEach((expense) => {
      counts.set(
        expense.payerId,
        (counts.get(expense.payerId) ?? 0) + 1,
      )
    })

    return counts
  }, [expenses])

  /**
   * Referential integrity: the API can cascade a person's expenses, but the
   * Week 1 UI deliberately blocks removal until those expenses are deleted by
   * hand. The API call then uses the real MongoDB id.
   */
  const handleRemoveMember = useCallback(
    async (memberId) => {
      const member = people.find((entry) => entry.id === memberId)

      if (!member) {
        return { ok: false }
      }

      const linkedExpenseCount = expenses.filter(
        (expense) => expense.payerId === memberId,
      ).length

      if (linkedExpenseCount > 0) {
        return { ok: false, code: 'linked-expenses' }
      }

      const result = await removePerson(memberId)

      if (result.ok) {
        // A concurrent cascade on the server could also remove expenses, so
        // re-read the collection after any person deletion.
        await refreshExpenses()
      }

      return result
    },
    [expenses, people, refreshExpenses, removePerson],
  )

  async function handleRetry() {
    setDismissedMessage('')
    setIsRetrying(true)

    try {
      await Promise.all([retryPeople(), retryExpenses()])
    } finally {
      setIsRetrying(false)
    }
  }

  function handleDismissNotice() {
    setDismissedMessage(noticeMessage)
  }

  const memberCount = people.length
  const hasExpenses = expenses.length > 0

  let guide

  if (peopleLoadError && !hasLoadedPeople) {
    guide = {
      target: 'group',
      kicker: 'Offline',
      copy: 'Start the SplitEasy API, then retry the group.',
    }
  } else if (expensesLoadError && !hasLoadedExpenses) {
    guide = {
      target: 'expenses',
      kicker: 'Offline',
      copy: 'The expense log could not be loaded. Try again.',
    }
  } else if (!hasLoadedPeople || !hasLoadedExpenses) {
    guide = {
      target: 'group',
      kicker: 'Connecting',
      copy: 'Loading your saved group from the API.',
    }
  } else if (memberCount === 0) {
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

  let footerIcon = <CheckIcon size={14} />
  let footerNote = 'Synced with the SplitEasy API — data is stored in MongoDB.'
  let footerClass = ''

  if (hasApiError) {
    footerIcon = <AlertCircleIcon size={14} />
    footerNote =
      'The SplitEasy API is unavailable — changes cannot be saved right now.'
    footerClass = ' site-footer__note--danger'
  } else if (isLoading) {
    footerIcon = <InfoIcon size={14} />
    footerNote = 'Connecting to the SplitEasy API…'
    footerClass = ' site-footer__note--loading'
  }

  return (
    <div className="app-shell" id="top">
      <a className="skip-link" href="#group">
        Skip to group setup
      </a>

      <Header />

      <main className="container main" id="main-content">
        {showNotice ? (
          <Notice
            message={noticeMessage}
            tone="danger"
            onDismiss={handleDismissNotice}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        ) : null}

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
                members={people}
                expenseCountsByMember={expenseCountsByMember}
                error={memberError}
                isAtLimit={memberCount >= MAX_GROUP_SIZE}
                remainingSlots={Math.max(MAX_GROUP_SIZE - memberCount, 0)}
                isLoading={isPeopleLoading}
                hasLoaded={hasLoadedPeople}
                loadError={peopleLoadError}
                isAdding={isAddingMember}
                removingId={removingId}
                isUnavailable={isPeopleUnavailable}
                onAddMember={addPerson}
                onRemoveMember={handleRemoveMember}
                onClearError={clearError}
                onRetry={retryPeople}
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
                members={people}
                expenses={expenses}
                canAddExpense={canAddExpense}
                isLoading={isExpenseDataLoading}
                hasLoaded={hasLoadedExpenseData}
                loadError={expenseDataError}
                isAdding={isAddingExpense}
                deletingId={deletingId}
                isUnavailable={isExpenseDataUnavailable}
                onAddExpense={addExpense}
                onDeleteExpense={removeExpense}
                onRetry={async () => {
                  await Promise.all([retryExpenses(), retryPeople()])
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p className={`site-footer__note${footerClass}`}>
            {footerIcon}
            {footerNote}
          </p>
          <p className="site-footer__meta">SplitEasy · equal splits, clearly.</p>
        </div>
      </footer>
    </div>
  )
}
