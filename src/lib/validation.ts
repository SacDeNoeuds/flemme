/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Primitive } from '../fields/primitive'

export type ValidationError = { type: errorType | string } & Record<string, any>

export type Validate<Value> = (value: Value | undefined | null) => ValidationError[]
export type ValidateAsync<Value> = (value: Value) => Promise<ValidationError[]>
export const composeValidate = <Value>(...validators: (Validate<Value> | undefined)[]): Validate<Value> => {
  return (value) => {
    for (const validate of validators) {
      const errors = validate?.(value) ?? []
      if (errors.length > 0) return errors // fail fast
    }
    return []
  }
}

export enum errorType {
  mustBeNotNil = 'mustBeNotNil',
  mustBeString = 'mustBeString',
  mustHaveMinLength = 'mustHaveMinLength',
  mustHaveMaxLength = 'mustHaveMaxLength',
  mustBeOneOf = 'mustBeOneOf',
  mustBeNumber = 'mustBeNumber',
  mustBeDate = 'mustBeDate',
  mustBeBoolean = 'mustBeBoolean',
}

export const isNil = (value: unknown): value is null | undefined => {
  return value === undefined || value === null
}

export const mustBeNotNil = (): Validate<any> => (value) => {
  return isNil(value) ? [{ type: errorType.mustBeNotNil, value }] : []
}

export const makeValidator = <T>(predicate: (value: T) => boolean, mapError: (value: any) => ValidationError): Validate<T> => {
  return (value: any) => {
    return isNil(value) || predicate(value) ? [] : [mapError(value)]
  }
}

const isString = (value: unknown): value is string => typeof value === 'string'
export const mustBeString = () => makeValidator(isString, (value) => ({ type: errorType.mustBeString, value }))

const hasMinLength = (min: number) => (value: { length: number }) => value.length >= min
export const mustHaveMinLength = (min: number) => makeValidator(hasMinLength(min), (value) => ({ type: errorType.mustHaveMinLength, value, min }))

const hasMaxLength = (max: number) => (value: { length: number }) => value.length <= max
export const mustHaveMaxLength = (max: number) => makeValidator(hasMaxLength(max), (value) => ({ type: errorType.mustHaveMaxLength, value, max }))

export const isOneOf = <T extends Primitive>(literals: T[]) => {
  return (value: unknown): value is T => literals.includes(value as any)
}
export const mustBeOneOf = <T extends Primitive>(literals: T[]) => makeValidator(isOneOf(literals), (value) => ({ type: errorType.mustBeOneOf, value, literals }))

export const isNumber = (value: unknown): value is number => {
  const n = parseFloat(value as any)
  return !Number.isNaN(n) && Number.isFinite(n)
}
export const mustBeNumber = () => makeValidator(isNumber, (value) => ({ type: errorType.mustBeNumber, value }))

export const isDate = (value: unknown): value is Date => value instanceof Date && value.toString() !== 'Invalid Date'
export const mustBeDate = () => makeValidator(isDate, (value) => ({ type: errorType.mustBeDate, value }))

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const mustBeBoolean = () => makeValidator(isBoolean, (value) => ({ type: errorType.mustBeBoolean, value }))
