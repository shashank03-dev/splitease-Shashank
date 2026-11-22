import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_NAME_LENGTH,
  getInitials,
  normalizeName,
  validateMemberName,
} from '../src/utils/memberUtils.js'

const members = [
  { id: 'aman', name: 'Aman' },
  { id: 'riya', name: 'Riya' },
]

test('normalizes repeated and surrounding whitespace in member names', () => {
  assert.equal(normalizeName('  Aman   Kumar  '), 'Aman Kumar')
  assert.equal(normalizeName(null), '')
  assert.equal(normalizeName(undefined), '')
})

test('rejects empty and whitespace-only member names', () => {
  assert.deepEqual(validateMemberName('', members), {
    ok: false,
    message: 'Enter a name.',
  })
  assert.deepEqual(validateMemberName('   ', members), {
    ok: false,
    message: 'Enter a name.',
  })
})

test('rejects duplicate member names regardless of case or extra spaces', () => {
  assert.deepEqual(validateMemberName(' AMAN ', members), {
    ok: false,
    message: 'AMAN is already in the group.',
  })
  assert.equal(validateMemberName('  riya  ', members).ok, false)
})

test('rejects names longer than the maximum', () => {
  const result = validateMemberName('a'.repeat(MAX_NAME_LENGTH + 1), members)

  assert.equal(result.ok, false)
  assert.match(result.message, /32 characters or fewer/)
})

test('accepts a unique name and returns the normalized value', () => {
  assert.deepEqual(validateMemberName('  Karan   Mehta ', members), {
    ok: true,
    name: 'Karan Mehta',
  })
})

test('derives initials for one, two, and many-word names', () => {
  assert.equal(getInitials('Aman'), 'AM')
  assert.equal(getInitials('Aman Kumar'), 'AK')
  assert.equal(getInitials('Aman Kumar Singh'), 'AS')
  assert.equal(getInitials('   '), '?')
})
