import { apiRequest } from './apiClient'
import {
  mapPeople,
  mapPerson,
  sortPeopleByName,
} from '../utils/apiMappers'

/**
 * GET /api/people
 * The response is normalized to { id, name }, where id is the MongoDB _id.
 */
export async function fetchPeople({ signal } = {}) {
  const payload = await apiRequest('/people', { signal })

  return sortPeopleByName(mapPeople(payload.data))
}

/** POST /api/people */
export async function createPerson(name) {
  const payload = await apiRequest('/people', {
    method: 'POST',
    body: { name },
  })

  return mapPerson(payload.data)
}

/** DELETE /api/people/:id */
export async function deletePerson(personId) {
  const payload = await apiRequest(
    `/people/${encodeURIComponent(personId)}`,
    { method: 'DELETE' },
  )

  return payload.data ?? null
}
