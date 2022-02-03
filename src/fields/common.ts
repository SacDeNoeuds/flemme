/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PrimitiveField, Primitive, PrimitiveDescriptor } from './primitive'
import type { ArrayDescriptor, ArrayField } from './array'
import type { ObjectField, ObjectDescriptor } from './object'
import { Form } from './form'
import { lazy, Lazy } from '../lib/lazy'
import { Validator, ValidationError } from '../lib/validation'

export type Obj = Record<string, any>
export function assign<A extends Obj, B extends Obj>(a: A, b: B): A & B
export function assign<A extends Obj, B extends Obj, C extends Obj>(a: A, b: B, c: C): A & B & C
export function assign(a: Obj, ...objects: Array<Obj>) {
  Object.defineProperties(a, {
    ...Object.assign({}, ...objects.map(Object.getOwnPropertyDescriptors)),
  })
  return a
}

// Listeners / Observable / Event system
export type Unlisten = () => void
export type Listener<Value> = (field: InferField<Value>) => void
export const events = ['change', 'blur', 'focus', 'reset', 'validated', 'validateAsync'] as const
export const bubblingEvents: EventName[] = ['blur', 'change', 'focus', 'reset']
export type EventName = typeof events[number]
export type Listeners<Value> = Record<EventName, Listener<Value>[]>

// Field types
export type InferField<Value> = NonNullable<Value> extends any[]
  ? // @ts-ignore
    ArrayField<Value>
  : NonNullable<Value> extends Primitive
  ? // @ts-ignore
    PrimitiveField<Value>
  : NonNullable<Value> extends Obj
  ? ObjectField<Value>
  : never

/* prettier-ignore */
export type AnyField<T = any> =
  | PrimitiveField<Extract<T, Primitive | undefined | null>>
  | ArrayField<Extract<T, any[] | undefined | null>>
  | ObjectField<Extract<T, Obj | undefined | null>>

/* prettier-ignore */
export type InferValue<T> = T extends (...args: any) => Form<infer Value>
  ? Value
  : T extends (...args: any[]) => BaseDescriptor<infer Result>
  ? Result
  : T extends BaseDescriptor<infer Result>
  ? Result
  : never

// prettier-ignore
type FieldValueState<Value> =
  | { valid: true, errors: [], value: Value }
  | { valid: false, errors: ValidationError[], value: Value | undefined | null }
// prettier-ignore
type FieldDirtyState =
  | { dirty: true, pristine: false }
  | { dirty: false, pristine: true }

// prettier-ignore
export type FieldState<Value = any> = FieldValueState<Value> & FieldDirtyState & {
  /** Initial value of the field, might be undefined (or null) when field is a new array item field for instance */
  readonly initial: Value | undefined | null
  /** true` when a change − even to same value − has been made. Object and array reflect that value as well */
  readonly touched: boolean
  /** `true` when the field has gained focus, never changes to false until a reset */
  readonly visited: boolean
  /**
   * For primitive fields, `true` when the field has gained focus then `false` when losing it.
   * For object and array fields, `true` if some of their inner fields visited value is `true`, `false` otherwise
   */
  readonly active: boolean
  readonly required: boolean
}
export type FieldRest<T extends AnyField<any>> = Omit<T, keyof FieldState>

// prettier-ignore
export type BaseField<Value> = {
  readonly name: string
  reset(nextInitial?: Value | undefined | null): void
  validate(): void
  on(eventName: EventName, listener: Listener<Value>): Unlisten
  change(value: Value | undefined | null): void
} & FieldState<Value>

export type InjectedData = {
  path: Array<string | number>
  validateOn: Exclude<EventName, 'reset'>[]
}

export interface Internals<Value> {
  lazyUntil: <Fn extends (...args: any[]) => any>(eventNames: EventName[], fn: Fn) => Lazy<Fn>
  notify: (eventName: EventName) => void
  on(eventName: EventName, listener: Listener<Value>): Unlisten
}
export const makeInternals = <Field extends BaseField<any>>(field: Field): Internals<Field['value']> => {
  type Value = Field['value']
  const listeners = Object.fromEntries(events.map((eventName) => [eventName, []])) as unknown as Listeners<Value>
  const internals: Internals<Field['value']> = {
    lazyUntil: (eventNames, fn) => {
      const lazyFn = lazy(fn)
      eventNames.forEach((eventName) => internals.on(eventName, lazyFn.flush))
      return lazyFn
    },
    notify: (eventName) => listeners[eventName].forEach((listener) => listener(field as unknown as InferField<Value>)),
    on: (eventName, listener) => {
      listeners[eventName].push(listener)
      return () => {
        listeners[eventName].splice(listeners[eventName].indexOf(listener), 1)
      }
    },
  }
  return internals
}

export interface BaseDescriptor<Value> {
  type: 'primitive' | 'object' | 'array' // useful only to discriminate types
  validators?: Validator<Value>[]
  onInit?: (field: InferField<Value>) => void
  isRequired: boolean
  create(initial: Value | undefined, injected: InjectedData): InferField<Value>
}

/* prettier-ignore */
export type Descriptor<T = any> =
  | PrimitiveDescriptor<Extract<T, Primitive | undefined | null>>
  | ArrayDescriptor<Extract<T, any[] | undefined | null>>
  | ObjectDescriptor<Extract<T, Obj | undefined | null>>

export type InferDescriptor<Value> = NonNullable<Value> extends any[]
  ? // @ts-ignore
    ArrayDescriptor<Value>
  : NonNullable<Value> extends Primitive
  ? // @ts-ignore
    PrimitiveDescriptor<Value>
  : NonNullable<Value> extends Obj
  ? ObjectDescriptor<Value>
  : never
