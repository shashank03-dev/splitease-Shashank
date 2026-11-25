import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getApiErrorField,
  getApiErrorMessage,
} from '../services/apiClient'
import {
  createPerson,
  deletePerson,
  fetchPeople,
} from '../services/peopleApi'
import { sortPeopleByName } from '../utils/apiMappers'
import { MAX_GROUP_SIZE, validateMemberName } from '../utils/memberUtils'

/**
 * Owns the people collection from MongoDB.
 *
 * The initial GET runs once when the app mounts. Mutations call the API, use
 * the server's response (including the real MongoDB _id), then re-fetch so the
 * API remains the single source of truth. Loading and error state live here
 * so the presentational components only render what they are given.
 */
export function usePeople() {
  const [people, setPeople] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const latestRequestId = useRef(0)

  const loadPeople = useCallback(async ({ silent = false } = {}) => {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId

    if (!silent) {
      setIsLoading(true)
      setLoadError('')
    }

    try {
      const nextPeople = await fetchPeople()

      if (requestId === latestRequestId.current) {
        setPeople(nextPeople)
        setHasLoaded(true)
        setLoadError('')
      }

      return { ok: true }
    } catch (loadFailure) {
      if (loadFailure?.name === 'AbortError') {
        return { ok: false, aborted: true }
      }

      const message = getApiErrorMessage(
        loadFailure,
        'Could not load people from the SplitEasy API.',
      )

      if (requestId === latestRequestId.current) {
        setLoadError(message)
      }

      return { ok: false, message }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId

    fetchPeople({ signal: controller.signal })
      .then((nextPeople) => {
        if (requestId !== latestRequestId.current) {
          return
        }

        setPeople(nextPeople)
        setHasLoaded(true)
        setLoadError('')
      })
      .catch((loadFailure) => {
        if (
          loadFailure?.name === 'AbortError' ||
          requestId !== latestRequestId.current
        ) {
          return
        }

        setLoadError(
          getApiErrorMessage(
            loadFailure,
            'Could not load people from the SplitEasy API.',
          ),
        )
      })
      .finally(() => {
        if (
          requestId === latestRequestId.current &&
          !controller.signal.aborted
        ) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  const addPerson = useCallback(
    async (rawName) => {
      if (people.length >= MAX_GROUP_SIZE) {
        const message = 'Group is full. Remove a member to add another.'
        setError(message)
        return { ok: false, field: 'form', message }
      }

      const validation = validateMemberName(rawName, people)

      if (!validation.ok) {
        setError(validation.message)
        return { ...validation, field: 'name' }
      }

      setIsAdding(true)
      setError('')

      try {
        const createdPerson = await createPerson(validation.name)

        // Apply the canonical server document immediately, then re-fetch so
        // ordering and any concurrent changes come from MongoDB.
        setPeople((currentPeople) =>
          sortPeopleByName([
            ...currentPeople.filter(
              (person) => person.id !== createdPerson.id,
            ),
            createdPerson,
          ]),
        )

        await loadPeople({ silent: true })

        return { ok: true, person: createdPerson }
      } catch (failure) {
        const message = getApiErrorMessage(
          failure,
          'Could not add this person. Please try again.',
        )

        setError(message)

        return {
          ok: false,
          field: getApiErrorField(failure) || 'form',
          message,
        }
      } finally {
        setIsAdding(false)
      }
    },
    [loadPeople, people],
  )

  const removePerson = useCallback(
    async (personId) => {
      setRemovingId(personId)
      setError('')

      try {
        await deletePerson(personId)
        setPeople((currentPeople) =>
          currentPeople.filter((person) => person.id !== personId),
        )

        await loadPeople({ silent: true })

        return { ok: true }
      } catch (failure) {
        const message = getApiErrorMessage(
          failure,
          'Could not remove this person. Please try again.',
        )

        setError(message)

        return { ok: false, message }
      } finally {
        setRemovingId(null)
      }
    },
    [loadPeople],
  )

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const retry = useCallback(() => loadPeople(), [loadPeople])

  return {
    people,
    isLoading,
    hasLoaded,
    loadError,
    error,
    isAdding,
    removingId,
    addPerson,
    removePerson,
    clearError,
    retry,
  }
}
