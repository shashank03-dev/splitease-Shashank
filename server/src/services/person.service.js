import { ApiError } from '../utils/apiError.js'

const PERSON_ID_PATTERN = /^[a-f\d]{24}$/i

/**
 * Single integration point between expenses and people.
 *
 * Today the Person model does not exist, so this only checks that `paidBy` is
 * a syntactically valid MongoDB ObjectId. On Day 4, add the Person model and
 * replace the comment below with a real existence check. No other expense code
 * will need to change.
 */
export async function validatePayerReference(paidBy) {
  if (typeof paidBy !== 'string' || !PERSON_ID_PATTERN.test(paidBy)) {
    throw new ApiError(400, 'Validation failed.', [
      { field: 'paidBy', message: 'paidBy must be a valid person id.' },
    ])
  }

  // Day 4:
  // const personExists = await Person.exists({ _id: paidBy })
  // if (!personExists) {
  //   throw new ApiError(400, 'Validation failed.', [
  //     { field: 'paidBy', message: 'paidBy does not refer to an existing person.' },
  //   ])
  // }

  return paidBy
}
