/* eslint-disable @typescript-eslint/no-explicit-any */
import { mustNotContain } from '../fields/spec-helpers'
import { mustHaveMinLength, mustHaveMaxLength, composeValidate, errorType } from './validation'

describe('composeValidate', () => {
  const validate = composeValidate(mustNotContain('Paris'), undefined, mustNotContain('Tokyo'))
  it('should return no error', () => {
    expect(validate('Some text')).toEqual([])
  })

  it('should return one error', () => {
    expect(validate('Go to Paris')).toEqual([{ type: mustNotContain.type, forbidden: 'Paris', value: 'Go to Paris' }])
    expect(validate('Go to Tokyo')).toEqual([{ type: mustNotContain.type, forbidden: 'Tokyo', value: 'Go to Tokyo' }])
  })

  it('should return first error in order of validators', () => {
    expect(validate('Go to Paris or Tokyo')).toEqual([{ type: mustNotContain.type, forbidden: 'Paris', value: 'Go to Paris or Tokyo' }])
  })
})

describe('validators', () => {
  const min = 2
  const minError = (value: any) => ({ type: errorType.mustHaveMinLength, value, min })
  const max = 4
  const maxError = (value: any) => ({ type: errorType.mustHaveMaxLength, value, max })
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
})
