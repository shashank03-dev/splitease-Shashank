import { toPaise } from './expenseUtils.js'
import { MIN_GROUP_SIZE } from './memberUtils.js'

export const BALANCE_STATUS = Object.freeze({
  OWED: 'owed',
  OWES: 'owes',
  SETTLED: 'settled',
})

/**
 * Sums every expense into integer paise.
 *
 * `reduce` is used instead of `total += amount` in a `forEach` because the
 * accumulator makes the operation a single expression with no mutable
 * variable outside the callback. Invalid amounts are ignored defensively;
 * the form already prevents them from being stored.
 */
export function calculateTotalExpenditure(expenses = []) {
  return expenses.reduce((totalPaise, expense) => {
    const amountPaise = toPaise(expense?.amount)

    return Number.isFinite(amountPaise) ? totalPaise + amountPaise : totalPaise
  }, 0)
}

/**
 * Divides the total into whole paise.
 *
 * Most totals divide exactly. When they do not, every member receives
 * `basePaise`, and the first `remainderPaise` members receive one extra paise.
 * For example, ₹100.00 across three people is 3333 + 3333 + 3334 paise.
 * That keeps every stored balance an integer and keeps the balances summing
 * to zero, at the cost of one member's share being one paise higher.
 *
 * `remainderPaise` is both an amount and the count of members receiving the
 * extra paise because one paise is allocated per member.
 */
export function calculateEqualShare(totalPaise, memberCount) {
  if (memberCount <= 0 || !Number.isFinite(totalPaise)) {
    return {
      basePaise: 0,
      maxPaise: 0,
      remainderPaise: 0,
      isEven: true,
    }
  }

  const safeTotalPaise = Math.max(0, Math.round(totalPaise))
  const basePaise = Math.floor(safeTotalPaise / memberCount)
  const remainderPaise = safeTotalPaise % memberCount

  return {
    basePaise,
    maxPaise: basePaise + (remainderPaise > 0 ? 1 : 0),
    remainderPaise,
    isEven: remainderPaise === 0,
  }
}

/**
 * Builds a member-id -> contribution map in paise.
 *
 * The id, not the display name, is the relationship between an expense and a
 * member. Expenses whose payer is no longer in the group are skipped here,
 * but their amounts remain part of the group total.
 */
export function calculateMemberContributions(members = [], expenses = []) {
  const contributions = new Map(members.map((member) => [member.id, 0]))

  expenses.forEach((expense) => {
    if (!contributions.has(expense?.payerId)) {
      return
    }

    const amountPaise = toPaise(expense.amount)

    if (!Number.isFinite(amountPaise)) {
      return
    }

    contributions.set(
      expense.payerId,
      contributions.get(expense.payerId) + amountPaise,
    )
  })

  return contributions
}

export function getBalanceStatus(balancePaise) {
  if (balancePaise > 0) {
    return BALANCE_STATUS.OWED
  }

  if (balancePaise < 0) {
    return BALANCE_STATUS.OWES
  }

  return BALANCE_STATUS.SETTLED
}

function buildMemberBalances(members, expenses, totalPaise) {
  const { basePaise, remainderPaise } = calculateEqualShare(
    totalPaise,
    members.length,
  )
  const contributions = calculateMemberContributions(members, expenses)

  return members.map((member, index) => {
    const contributionPaise = contributions.get(member.id) ?? 0
    const sharePaise = basePaise + (index < remainderPaise ? 1 : 0)
    const balancePaise = contributionPaise - sharePaise

    return {
      memberId: member.id,
      name: member.name,
      contributionPaise,
      sharePaise,
      balancePaise,
      status: getBalanceStatus(balancePaise),
    }
  })
}

/**
 * Calculates one row per current member.
 *
 * balance = contribution - equal share
 * Positive means the member is owed money; negative means they owe money.
 */
export function calculateMemberBalances(members = [], expenses = []) {
  return buildMemberBalances(
    members,
    expenses,
    calculateTotalExpenditure(expenses),
  )
}

/**
 * The single derived object consumed by the summary and balance components.
 * Nothing in here is stored in React state; it is rebuilt from the current
 * member and expense arrays on every render.
 */
export function calculateGroupBalances(members = [], expenses = []) {
  const totalPaise = calculateTotalExpenditure(expenses)
  const memberCount = members.length
  const balances = buildMemberBalances(members, expenses, totalPaise)
  const attributedPaise = balances.reduce(
    (sum, balance) => sum + balance.contributionPaise,
    0,
  )
  const unattributedPaise = Math.max(totalPaise - attributedPaise, 0)

  return {
    totalPaise,
    memberCount,
    expenseCount: expenses.length,
    canSplit: memberCount >= MIN_GROUP_SIZE,
    equalShare: calculateEqualShare(totalPaise, memberCount),
    balances,
    hasFormerPayerExpenses: unattributedPaise > 0,
    unattributedPaise,
  }
}
