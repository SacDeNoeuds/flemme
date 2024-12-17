/* eslint-disable @typescript-eslint/no-explicit-any */
export const isNil = (value: any): value is null | undefined => {
  return value === null || value === undefined
}
export const ensureDefined = <T>(value: T, message = 'Expected value to be defined'): NonNullable<T> => {
  if (isNil(value)) throw new Error(message)
  return value as NonNullable<T>
}
