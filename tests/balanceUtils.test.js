import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BALANCE_STATUS,
  calculateEqualShare,
  calculateGroupBalances,
  calculateMemberBalances,
  calculateMemberContributions,
  calculateTotalExpenditure,
  getBalanceStatus,
} from '../src/utils/balanceUtils.js'
import {
  formatExpenseAmount,
  formatPaise,
  toPaise,
} from '../src/utils/expenseUtils.js'

const members = [
  { id: 'aman', name: 'Aman' },
  { id: 'riya', name: 'Riya' },
  { id: 'karan', name: 'Karan' },
]

function makeExpense(id, amount, payerId, description = 'Expense') {
  const payer = members.find((member) => member.id === payerId)

  return {
    id,
    description,
    amount,
    payerId,
    payerName: payer?.name ?? 'Former member',
  }
}

function balancesOf(group) {
  return group.balances.map(
    ({ name, contributionPaise, balancePaise, status }) => ({
      name,
      contributionPaise,
      balancePaise,
      status,
    }),
  )
}

test('splits the official assignment example correctly', () => {
  const expenses = [
    makeExpense('e1', 300, 'riya', 'Snacks'),
    makeExpense('e2', 900, 'aman', 'Dinner'),
  ]

  const group = calculateGroupBalances(members, expenses)

  assert.equal(group.totalPaise, 120000)
  assert.equal(group.equalShare.basePaise, 40000)
  assert.equal(group.equalShare.remainderPaise, 0)
  assert.equal(group.memberCount, 3)
  assert.deepEqual(balancesOf(group), [
    {
      name: 'Aman',
      contributionPaise: 90000,
      balancePaise: 50000,
      status: BALANCE_STATUS.OWED,
    },
    {
      name: 'Riya',
      contributionPaise: 30000,
      balancePaise: -10000,
      status: BALANCE_STATUS.OWES,
    },
    {
      name: 'Karan',
      contributionPaise: 0,
      balancePaise: -40000,
      status: BALANCE_STATUS.OWES,
    },
  ])

  assert.equal(formatPaise(group.totalPaise), '₹1,200.00')
  assert.equal(formatPaise(group.equalShare.basePaise), '₹400.00')
  assert.equal(formatPaise(group.balances[0].balancePaise), '₹500.00')
  assert.equal(formatPaise(Math.abs(group.balances[1].balancePaise)), '₹100.00')
  assert.equal(formatPaise(Math.abs(group.balances[2].balancePaise)), '₹400.00')
})

test('returns a settled zero summary when there are no expenses', () => {
  const group = calculateGroupBalances(members, [])

  assert.equal(group.totalPaise, 0)
  assert.equal(group.memberCount, 3)
  assert.equal(group.expenseCount, 0)
  assert.deepEqual(group.equalShare, {
    basePaise: 0,
    maxPaise: 0,
    remainderPaise: 0,
    isEven: true,
  })
  assert.equal(group.canSplit, true)
  assert.deepEqual(
    balancesOf(group).map(({ balancePaise, status }) => ({
      balancePaise,
      status,
    })),
    members.map(() => ({
      balancePaise: 0,
      status: BALANCE_STATUS.SETTLED,
    })),
  )
})

test('settles every member when contributions are equal', () => {
  const expenses = members.map((member, index) =>
    makeExpense(`e${index + 1}`, 300, member.id),
  )

  const group = calculateGroupBalances(members, expenses)

  assert.equal(group.totalPaise, 90000)
  assert.equal(group.equalShare.basePaise, 30000)
  assert.deepEqual(
    group.balances.map(({ balancePaise, status }) => ({
      balancePaise,
      status,
    })),
    members.map(() => ({
      balancePaise: 0,
      status: BALANCE_STATUS.SETTLED,
    })),
  )
})

test('combines multiple expenses paid by the same member', () => {
  const expenses = [
    makeExpense('e1', 399.75, 'aman', 'Cab'),
    makeExpense('e2', 500.25, 'aman', 'Dinner'),
    makeExpense('e3', 300, 'riya', 'Snacks'),
  ]

  const group = calculateGroupBalances(members, expenses)

  assert.equal(group.totalPaise, 120000)
  assert.equal(group.equalShare.basePaise, 40000)
  assert.deepEqual(balancesOf(group), [
    {
      name: 'Aman',
      contributionPaise: 90000,
      balancePaise: 50000,
      status: BALANCE_STATUS.OWED,
    },
    {
      name: 'Riya',
      contributionPaise: 30000,
      balancePaise: -10000,
      status: BALANCE_STATUS.OWES,
    },
    {
      name: 'Karan',
      contributionPaise: 0,
      balancePaise: -40000,
      status: BALANCE_STATUS.OWES,
    },
  ])
})

test('keeps decimal currency calculations exact', () => {
  const expenses = [
    makeExpense('e1', 100.1, 'aman'),
    makeExpense('e2', 200.2, 'riya'),
    makeExpense('e3', 0.3, 'karan'),
  ]

  const group = calculateGroupBalances(members, expenses)

  assert.equal(group.totalPaise, 30060)
  assert.equal(group.equalShare.basePaise, 10020)
  assert.deepEqual(balancesOf(group), [
    {
      name: 'Aman',
      contributionPaise: 10010,
      balancePaise: -10,
      status: BALANCE_STATUS.OWES,
    },
    {
      name: 'Riya',
      contributionPaise: 20020,
      balancePaise: 10000,
      status: BALANCE_STATUS.OWED,
    },
    {
      name: 'Karan',
      contributionPaise: 30,
      balancePaise: -9990,
      status: BALANCE_STATUS.OWES,
    },
  ])
  assert.equal(formatPaise(Math.abs(group.balances[0].balancePaise)), '₹0.10')
  assert.equal(formatPaise(group.balances[1].balancePaise), '₹100.00')
  assert.equal(formatPaise(Math.abs(group.balances[2].balancePaise)), '₹99.90')
})

test('allocates an indivisible paise remainder so balances total zero', () => {
  const expenses = [makeExpense('e1', 100, 'aman')]

  const group = calculateGroupBalances(members, expenses)

  assert.equal(group.totalPaise, 10000)
  assert.deepEqual(group.equalShare, {
    basePaise: 3333,
    maxPaise: 3334,
    remainderPaise: 1,
    isEven: false,
  })
  assert.deepEqual(
    group.balances.map(({ sharePaise, balancePaise }) => ({
      sharePaise,
      balancePaise,
    })),
    [
      { sharePaise: 3334, balancePaise: 6666 },
      { sharePaise: 3333, balancePaise: -3333 },
      { sharePaise: 3333, balancePaise: -3333 },
    ],
  )
  assert.equal(
    group.balances.reduce(
      (total, balance) => total + balance.balancePaise,
      0,
    ),
    0,
  )
  assert.equal(formatPaise(group.balances[0].balancePaise), '₹66.66')
  assert.equal(formatPaise(Math.abs(group.balances[1].balancePaise)), '₹33.33')
})

test('flags expenses paid by a member who left the group', () => {
  const currentMembers = members.filter((member) => member.id !== 'aman')
  const group = calculateGroupBalances(currentMembers, [
    makeExpense('e1', 900, 'aman'),
    makeExpense('e2', 300, 'riya'),
  ])

  assert.equal(group.totalPaise, 120000)
  assert.equal(group.equalShare.basePaise, 60000)
  assert.equal(group.hasFormerPayerExpenses, true)
  assert.equal(group.unattributedPaise, 90000)
  assert.deepEqual(balancesOf(group), [
    {
      name: 'Riya',
      contributionPaise: 30000,
      balancePaise: -30000,
      status: BALANCE_STATUS.OWES,
    },
    {
      name: 'Karan',
      contributionPaise: 0,
      balancePaise: -60000,
      status: BALANCE_STATUS.OWES,
    },
  ])
})

test('handles a group with no members without dividing by zero', () => {
  const group = calculateGroupBalances([], [])

  assert.equal(group.totalPaise, 0)
  assert.equal(group.memberCount, 0)
  assert.equal(group.canSplit, false)
  assert.deepEqual(group.balances, [])
  assert.deepEqual(group.equalShare, {
    basePaise: 0,
    maxPaise: 0,
    remainderPaise: 0,
    isEven: true,
  })
})

test('handles a single member without dividing by zero', () => {
  const singleMember = [{ id: 'aman', name: 'Aman' }]
  const group = calculateGroupBalances(singleMember, [
    makeExpense('e1', 100, 'aman'),
  ])

  assert.equal(group.totalPaise, 10000)
  assert.equal(group.canSplit, false)
  assert.equal(group.equalShare.basePaise, 10000)
  assert.deepEqual(balancesOf(group), [
    {
      name: 'Aman',
      contributionPaise: 10000,
      balancePaise: 0,
      status: BALANCE_STATUS.SETTLED,
    },
  ])
})

test('calculates total expenditure from decimal amounts without float drift', () => {
  assert.equal(toPaise(0.1) + toPaise(0.2), 30)
  assert.equal(
    calculateTotalExpenditure([{ amount: 0.1 }, { amount: 0.2 }]),
    30,
  )
  assert.equal(formatPaise(30), '₹0.30')
  assert.equal(formatExpenseAmount(1200.5), '₹1,200.50')
})

test('calculates member contributions by payer id', () => {
  const expenses = [
    makeExpense('e1', 900, 'aman'),
    makeExpense('e2', 300, 'riya'),
  ]
  const contributions = calculateMemberContributions(members, expenses)

  assert.equal(contributions.get('aman'), 90000)
  assert.equal(contributions.get('riya'), 30000)
  assert.equal(contributions.get('karan'), 0)
})

test('calculates equal shares with an explicit remainder', () => {
  assert.deepEqual(calculateEqualShare(120000, 3), {
    basePaise: 40000,
    maxPaise: 40000,
    remainderPaise: 0,
    isEven: true,
  })
  assert.deepEqual(calculateEqualShare(10000, 3), {
    basePaise: 3333,
    maxPaise: 3334,
    remainderPaise: 1,
    isEven: false,
  })
  assert.deepEqual(calculateEqualShare(0, 0), {
    basePaise: 0,
    maxPaise: 0,
    remainderPaise: 0,
    isEven: true,
  })
})

test('exposes balance status based on the balance sign', () => {
  assert.equal(getBalanceStatus(1), BALANCE_STATUS.OWED)
  assert.equal(getBalanceStatus(0), BALANCE_STATUS.SETTLED)
  assert.equal(getBalanceStatus(-1), BALANCE_STATUS.OWES)
})

test('returns one balance row per current member', () => {
  const balances = calculateMemberBalances(members, [])

  assert.equal(balances.length, members.length)
  assert.deepEqual(
    balances.map(({ memberId, name }) => ({ memberId, name })),
    members.map(({ id, name }) => ({ memberId: id, name })),
  )
})
