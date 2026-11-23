import Expense, {
  MAX_DESCRIPTION_LENGTH,
} from '../models/expense.model.js'
import { validatePayerReference } from '../services/person.service.js'
import { ApiError } from '../utils/apiError.js'

function hasAtMostTwoDecimalPlaces(value) {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6
}

function validateExpenseBody(body) {
  const input = body && typeof body === 'object' ? body : {}
  const errors = []

  let description
  let amount
  let paidBy
  let date

  if (typeof input.description !== 'string' || input.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Description is required.',
    })
  } else if (input.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
    })
  } else {
    description = input.description.trim()
  }

  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a number.',
    })
  } else if (input.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0.',
    })
  } else if (!hasAtMostTwoDecimalPlaces(input.amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount can have at most 2 decimal places.',
    })
  } else {
    amount = input.amount
  }

  if (
    input.paidBy === undefined ||
    input.paidBy === null ||
    (typeof input.paidBy === 'string' && input.paidBy.trim() === '')
  ) {
    errors.push({
      field: 'paidBy',
      message: 'paidBy is required.',
    })
  } else if (typeof input.paidBy !== 'string') {
    errors.push({
      field: 'paidBy',
      message: 'paidBy must be a valid person id.',
    })
  } else {
    paidBy = input.paidBy.trim()
  }

  if (input.date !== undefined && input.date !== null && input.date !== '') {
    const parsedDate = new Date(input.date)

    if (Number.isNaN(parsedDate.getTime())) {
      errors.push({
        field: 'date',
        message: 'date must be a valid date.',
      })
    } else {
      date = parsedDate
    }
  }

  return {
    errors,
    values: { description, amount, paidBy, date },
  }
}

/**
 * GET /api/expenses
 * Returns every expense, newest first. An empty collection is still a 200.
 */
export async function listExpenses(req, res) {
  const expenses = await Expense.find()
    .sort({ date: -1, createdAt: -1, _id: -1 })
    .lean()

  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
  })
}

/**
 * POST /api/expenses
 * Validates the body, checks the payer reference, then persists the expense.
 */
export async function createExpense(req, res) {
  const { errors, values } = validateExpenseBody(req.body)

  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed.', errors)
  }

  // Kept separate so Day 4 can add the Person lookup without touching this file.
  await validatePayerReference(values.paidBy)

  const expense = await Expense.create({
    description: values.description,
    amount: values.amount,
    paidBy: values.paidBy,
    ...(values.date ? { date: values.date } : {}),
  })

  res.status(201).json({
    success: true,
    message: 'Expense created.',
    data: expense,
  })
}
