/* eslint-disable @typescript-eslint/no-explicit-any */
import { mustHaveMinLength, mustHaveMaxLength } from './validation'

const min = 2
const minError = (value: any) => ({
  message: typeof value === 'string' ? `Must be at least ${min} characters` : `Must have at least ${min} items`,
  meta: { value, min },
})
const max = 4
const maxError = (value: any) => ({
  message: typeof value === 'string' ? `Must be at least ${max} characters` : `Must have at least ${max} items`,
  meta: { value, max },
})
describe.each([
  ['min length', min, { validate: mustHaveMinLength(min), error: minError, passing: [2, 3], failing: [0, 1] }],
  ['max length', max, { validate: mustHaveMaxLength(max), error: maxError, passing: [0, 4], failing: [5, 6] }],
])('must have %s %s', (_, __, { validate, passing, failing, error }) => {
  const toString = (count: number) => new Array(count).fill('a').join('')
  const toArray = (count: number) => new Array(count).fill('a')

  describe('with string', () => {
    it.each(passing.map(toString))('should pass with "%s"', (value) => expect(validate(value)).toEqual([]))
    it.each(failing.map(toString))('should fail with "%s"', (value) => expect(validate(value)).toEqual([error(value)]))
  })

  describe('with array', () => {
    it.each([passing.map(toArray)])('should pass with "%s"', (value) => expect(validate(value)).toEqual([]))
    it.each([failing.map(toArray)])('should fail with "%s"', (value) => expect(validate(value)).toEqual([error(value)]))
  })
})
