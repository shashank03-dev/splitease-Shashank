export const MAX_EXPENSE_DESCRIPTION_LENGTH = 60

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function normalizeDescription(rawDescription = '') {
  return String(rawDescription ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Validates a proposed expense and returns a normalized expense payload.
 * The payer is resolved by member id so a display name is never trusted
 * as the relationship between an expense and a group member.
 */
export function validateExpense(
  { description: rawDescription, amount: rawAmount, payerId } = {},
  members,
) {
  const description = normalizeDescription(rawDescription)

  if (!description) {
    return {
      ok: false,
      field: 'description',
      message: 'Enter what the expense was for.',
    }
  }

  if (description.length > MAX_EXPENSE_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      field: 'description',
      message: `Keep the description to ${MAX_EXPENSE_DESCRIPTION_LENGTH} characters or fewer.`,
    }
  }

  const amountText = String(rawAmount ?? '').trim()

  if (!amountText) {
    return {
      ok: false,
      field: 'amount',
      message: 'Enter an amount.',
    }
  }

  if (!AMOUNT_PATTERN.test(amountText)) {
    return {
      ok: false,
      field: 'amount',
      message: 'Enter a valid amount with up to two decimals.',
    }
  }

  const amount = Number(amountText)

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      field: 'amount',
      message: 'Amount must be greater than zero.',
    }
  }

  if (!payerId) {
    return {
      ok: false,
      field: 'payerId',
      message: 'Choose who paid.',
    }
  }

  const payer = members.find((member) => member.id === payerId)

  if (!payer) {
    return {
      ok: false,
      field: 'payerId',
      message: 'Choose a current group member.',
    }
  }

  return {
    ok: true,
    expense: {
      description,
      amount,
      payerId: payer.id,
      payerName: payer.name,
    },
  }
}

export function formatExpenseAmount(amount) {
  return amountFormatter.format(amount)
}
