/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validator, mustBeBoolean, mustBeDate, mustBeNumber, mustBeOneOf, mustBeString } from '../lib/validation'
import { Descriptor, InferDescriptor } from './common'
import { Primitive, primitive } from './primitive'

export const optional = <T>(descriptor: Descriptor<T>): InferDescriptor<T | undefined> => ({
  ...(descriptor as unknown as InferDescriptor<T | undefined>),
  isRequired: false,
})
export const nullable = <T>(descriptor: Descriptor<T>): InferDescriptor<T | null> => ({
  ...(descriptor as unknown as InferDescriptor<T | null>),
  isRequired: false,
})

export const string = (...validators: Validator<string>[]) => primitive<string>(mustBeString(), ...validators)
export const number = (...validators: Validator<number>[]) => primitive<number>(mustBeNumber(), ...validators)
export const date = (...validators: Validator<Date>[]) => primitive<Date>(mustBeDate(), ...validators)
export const boolean = (...validators: Validator<boolean>[]) => primitive(mustBeBoolean(), ...validators)
export const oneOf = <Value extends Primitive>(literals: Value[], ...validators: Validator<Value>[]) => {
  return primitive<Value>(mustBeOneOf(literals), ...validators)
}
