import Expense from '../models/expense.model.js'
import Person, {
  MAX_NAME_LENGTH,
  PERSON_NAME_COLLATION,
} from '../models/person.model.js'
import { ApiError } from '../utils/apiError.js'
import { isObjectId } from '../utils/objectId.js'

function normalizeName(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.normalize('NFC').trim().replace(/\s+/g, ' ')
}

function duplicateNameError() {
  return new ApiError(400, 'Validation failed.', [
    {
      field: 'name',
      message: 'A person with this name already exists.',
    },
  ])
}

/**
 * GET /api/people
 * Returns every person in case-insensitive alphabetical order.
 */
export async function listPeople(req, res) {
  const people = await Person.find()
    .sort({ name: 1 })
    .collation(PERSON_NAME_COLLATION)
    .lean()

  res.status(200).json({
    success: true,
    count: people.length,
    data: people,
  })
}

/**
 * POST /api/people
 * Trims and normalizes the name, rejects duplicates, then creates the person.
 */
export async function createPerson(req, res) {
  const input = req.body && typeof req.body === 'object' ? req.body : {}
  const name = normalizeName(input.name)

  if (name === '') {
    throw new ApiError(400, 'Validation failed.', [
      { field: 'name', message: 'Name is required.' },
    ])
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new ApiError(400, 'Validation failed.', [
      {
        field: 'name',
        message: `Name must be at most ${MAX_NAME_LENGTH} characters.`,
      },
    ])
  }

  const existing = await Person.findOne({ name })
    .collation(PERSON_NAME_COLLATION)
    .select('_id')
    .lean()

  if (existing) {
    throw duplicateNameError()
  }

  let person

  try {
    person = await Person.create({ name })
  } catch (error) {
    // Covers the race where two requests pass the check at the same time.
    if (error?.code === 11000) {
      throw duplicateNameError()
    }

    throw error
  }

  res.status(201).json({
    success: true,
    message: 'Person created.',
    data: person,
  })
}

/**
 * DELETE /api/people/:id
 * Deletes the person's expenses first, then the person. If deleting the person
 * fails, the person still exists and the operation can be retried; deleting in
 * the other order could leave orphaned expenses.
 */
export async function deletePerson(req, res) {
  const { id } = req.params

  if (!isObjectId(id)) {
    throw new ApiError(404, 'Person not found.')
  }

  const person = await Person.findById(id)

  if (!person) {
    throw new ApiError(404, 'Person not found.')
  }

  const expenseResult = await Expense.deleteMany({ paidBy: person._id })
  await person.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Person deleted.',
    data: {
      person: {
        _id: person._id,
        name: person.name,
      },
      deletedExpenseCount: expenseResult.deletedCount,
    },
  })
}
