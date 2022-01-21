/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validate, ValidationError } from '../fields/common'
import type { Primitive } from '../fields/primitive'

const errors = {
  mustBeNotNil: (value: any): ValidationError => ({ message: 'Required', meta: { value } }),
  mustBeString: (value: any): ValidationError => ({ message: 'Expected a text', meta: { value } }),
  // prettier-ignore
  mustHaveMinLength: (min: number) => (value: any): ValidationError => ({
    message: typeof value === 'string' ? `Must be at least ${min} characters` : `Must have at least ${min} items`,
    meta: { value, min },
  }),
  // prettier-ignore
  mustHaveMaxLength: (max: number) => (value: any): ValidationError => ({
    message: typeof value === 'string' ? `Must be at least ${max} characters` : `Must have at least ${max} items`,
    meta: { value, max },
  }),
  // prettier-ignore
  mustBeOneOf: (literals: any[]) => (value: any): ValidationError => ({
    message: `Expected one of: ${literals.map((literal) => JSON.stringify(literal)).join(', ')}`,
    meta: { literals, value },
  }),
  mustBeNumber: (value: any): ValidationError => ({ message: 'Expected a number', meta: { value } }),
  mustBeDate: (value: any): ValidationError => ({ message: 'Expected a date', meta: { value } }),
  mustBeBoolean: (value: any): ValidationError => ({ message: 'Expected true/false', meta: { value } }),
}

export const overrideErrors = (overrides: Partial<Exclude<typeof errors, 'mustHaveMinLength' | 'mustHaveMaxLength'>>) => Object.assign(errors, overrides)

export const isNil = (value: unknown): value is null | undefined => {
  return value === undefined || value === null
}

export const mustBeNotNil = (): Validate<any> => (value) => {
  return isNil(value) ? [errors.mustBeNotNil(value)] : []
}

export const makeValidator = <T>(predicate: (value: T) => boolean, mapError: (value: any) => ValidationError): Validate<T> => {
  return (value: any) => {
    return isNil(value) || predicate(value) ? [] : [mapError(value)]
  }
}

const isString = (value: unknown): value is string => typeof value === 'string'
export const mustBeString = () => makeValidator(isString, errors.mustBeString)

const hasMinLength = (min: number) => (value: { length: number }) => value.length >= min
export const mustHaveMinLength = (min: number) => makeValidator(hasMinLength(min), errors.mustHaveMinLength(min))

const hasMaxLength = (max: number) => (value: { length: number }) => value.length <= max
export const mustHaveMaxLength = (max: number) => makeValidator(hasMaxLength(max), errors.mustHaveMaxLength(max))

export const isOneOf = <T extends Primitive>(literals: T[]) => {
  return (value: unknown): value is T => literals.includes(value as any)
}
export const mustBeOneOf = <T extends Primitive>(literals: T[]) => makeValidator(isOneOf(literals), errors.mustBeOneOf(literals))

export const isNumber = (value: unknown): value is number => {
  const n = parseFloat(value as any)
  return !Number.isNaN(n) && Number.isFinite(n)
}
export const mustBeNumber = () => makeValidator(isNumber, errors.mustBeNumber)

export const isDate = (value: unknown): value is Date => value instanceof Date && value.toString() !== 'Invalid Date'
export const mustBeDate = () => makeValidator(isDate, errors.mustBeDate)

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const mustBeBoolean = () => makeValidator(isBoolean, errors.mustBeBoolean)
