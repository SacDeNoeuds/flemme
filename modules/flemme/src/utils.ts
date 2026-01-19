import { Get, Paths } from 'type-fest'

export const get = <T, P extends Paths<T>>(source: T, path: P): Get<T, Extract<P, string>> => {
  return (path as string).split('.').reduce((acc, segment) => {
    const isIndex = /[0-9]+/.test(segment)
    return acc[isIndex ? Number(segment) : segment]
  }, source as any)
}

export const set = <T extends object, P extends Paths<T>>(source: T, path: P, value: Get<T, Extract<P, string>>) => {
  ;(path as string).split('.').forEach((segment, index, array) => {
    const isIndex = /[0-9]+/.test(segment)
    const key = isIndex ? Number(segment) : segment
    const isLastSegment = index === array.length - 1
    if (isLastSegment) (source as any)[key] = value
    source = (source as any)[key]
  })
}

const cannotCompare = (name: string): never => {
  throw new Error(`cannot compare ${name}`)
}
const primitiveTypes = new Set(['string', 'number', 'bigint', 'boolean'])
/**
 * This function only handles values that can be used in forms:
 * - primitives
 * - object
 * - array
 * - classes like Date or File
 */
export const isEqual = (a: any, b: any): boolean => {
  if (typeof a !== typeof b) return false
  if (typeof a === 'function') cannotCompare('functions')
  if (typeof a === 'symbol') cannotCompare('symbol')
  if (typeof a === 'undefined') return true // because typeof b === typeof a
  if (primitiveTypes.has(typeof a)) return Object.is(a, b)
  // typeof a and b is 'object' at this stage
  if (a === null) return b === null

  // Object `null` proto are optimizations that will likely
  // not be used when building frontend forms
  if (a.constructor !== b.constructor) return false

  if (a instanceof Date) return a.valueOf() === b.valueOf()
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    return a.every((value, index) => isEqual(value, b[index]))
  }
  if (a.constructor === Object) {
    const entriesOfA = Object.entries(a)
    const keysOfB = Object.entries(b)
    if (entriesOfA.length !== keysOfB.length) return false
    return entriesOfA.every(([key, value]) => isEqual(value, b[key]))
  }

  // strict equal for remaining references like `File` or `Blob`
  return Object.is(a, b)
}

export const clone = (value: any): any => {
  if (Array.isArray(value)) return value.map(clone)
  if (value?.constructor === Object) {
    const entries = Object.entries(value)
    return Object.fromEntries(entries.map(([key, value]) => [key, clone(value)]))
  }
  // See MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object
  // if `value` is an object, its reference is preserved.
  // else an object is instantiated.
  // Therefore: `value` is a primitive if an object is instantiated.
  if (Object(value) !== value) return value
  if (typeof value === 'function') return value

  try {
    // handle instances that can be copied through constructor, like `Date`.
    return new value.constructor(value)
  } catch {
    return value
  }
}
