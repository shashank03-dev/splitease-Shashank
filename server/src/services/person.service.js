import Person from '../models/person.model.js'
import { ApiError } from '../utils/apiError.js'
import { isObjectId } from '../utils/objectId.js'

/**
 * Single integration point between expenses and people.
 *
 * Both the create and update expense flows call this before writing, so an
 * expense can never point at a person that does not exist.
 */
export async function validatePayerReference(paidBy) {
  if (!isObjectId(paidBy)) {
    throw new ApiError(400, 'Validation failed.', [
      { field: 'paidBy', message: 'paidBy must be a valid person id.' },
    ])
  }

  const personExists = await Person.exists({ _id: paidBy })

  if (!personExists) {
    throw new ApiError(400, 'Validation failed.', [
      {
        field: 'paidBy',
        message: 'paidBy does not refer to an existing person.',
      },
    ])
  }

  return paidBy
}
