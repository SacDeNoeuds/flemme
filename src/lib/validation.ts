/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Primitive } from '../fields/primitive'

export type ValidationError = { type: ErrorType | string } & Record<string, any>

export type Validator<Value> = (value: Value | undefined | null) => ValidationError[]
export type ValidateAsync<Value> = (value: Value) => Promise<ValidationError[]>
export const composeValidate = <Value>(...validators: (Validator<Value> | undefined)[]): Validator<Value> => {
  return (value) => {
    for (const validate of validators) {
      const errors = validate?.(value) ?? []
      if (errors.length > 0) return errors // fail fast
    }
    return []
  }
}

export enum ErrorType {
  Nil = 'Nil',
  String = 'String',
  MinLength = 'MinLength',
  MaxLength = 'MaxLength',
  Min = 'Min',
  Max = 'Max',
  OneOf = 'OneOf',
  Number = 'Number',
  Date = 'Date',
  Boolean = 'Boolean',
}

export const isNil = (value: unknown): value is null | undefined => {
  return value === undefined || value === null
}

export const mustBeNotNil = (): Validator<any> => (value) => {
  return isNil(value) ? [{ type: ErrorType.Nil, value }] : []
}

export const makeValidator = <T>(predicate: (value: T) => boolean, mapError: (value: any) => ValidationError): Validator<T> => {
  return (value: any) => {
    return isNil(value) || predicate(value) ? [] : [mapError(value)]
  }
}

const isString = (value: unknown): value is string => typeof value === 'string'
export const mustBeString = () => makeValidator(isString, (value) => ({ type: ErrorType.String, value }))

const hasMinLength = (min: number) => (value: { length: number }) => value.length >= min
export const minLength = (min: number, type: string = ErrorType.MinLength) => makeValidator(hasMinLength(min), (value) => ({ type, value, min }))

const hasMaxLength = (max: number) => (value: { length: number }) => value.length <= max
export const maxLength = (max: number, type: string = ErrorType.MaxLength) => makeValidator(hasMaxLength(max), (value) => ({ type, value, max }))

const isGreaterThan = (min: number) => (n: number) => n > min
export const min = (min: number, type: string = ErrorType.Min) => makeValidator(isGreaterThan(min), (value) => ({ type, value, min }))

const isLowerThan = (max: number) => (n: number) => n < max
export const max = (max: number, type: string = ErrorType.Max) => makeValidator(isLowerThan(max), (value) => ({ type, value, max }))

export const isOneOf = <T extends Primitive>(literals: T[]) => {
  return (value: unknown): value is T => literals.includes(value as any)
}
export const mustBeOneOf = <T extends Primitive>(literals: T[]) => makeValidator(isOneOf(literals), (value) => ({ type: ErrorType.OneOf, value, literals }))

export const isNumber = (value: unknown): value is number => {
  const n = parseFloat(value as any)
  return !Number.isNaN(n) && Number.isFinite(n)
}
export const mustBeNumber = () => makeValidator(isNumber, (value) => ({ type: ErrorType.Number, value }))

export const isDate = (value: unknown): value is Date => value instanceof Date && value.toString() !== 'Invalid Date'
export const mustBeDate = () => makeValidator(isDate, (value) => ({ type: ErrorType.Date, value }))

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const mustBeBoolean = () => makeValidator(isBoolean, (value) => ({ type: ErrorType.Boolean, value }))
