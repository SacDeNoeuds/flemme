/* eslint-disable @typescript-eslint/no-explicit-any */

type IterableValue<T> = T extends Iterable<infer Value> ? Value : never
export const applyWhen = <T extends Iterable<any>>(
  iterable: T,
  predicate: (value: IterableValue<T>) => boolean,
  apply: (value: IterableValue<T>) => void,
): void => {
  for (const value of iterable) {
    if (predicate(value)) apply(value)
  }
}

export const removeBy = <T>(set: Set<T>, predicate: (value: T) => boolean) =>
  applyWhen(set, predicate, (value) => set.delete(value))

export const some = <T>(iterable: Iterable<T>, predicate: (value: T) => boolean) => {
  for (const value of iterable) {
    if (predicate(value)) return true
  }
  return false
}

export const addItem = <T>(value: T[], item: T, atIndex = value.length): T[] => [
  ...value.slice(0, atIndex),
  item,
  ...value.slice(atIndex),
]

export const removeItem = <T>(value: T[], atIndex: number) => value.filter((_, index) => index !== atIndex)
