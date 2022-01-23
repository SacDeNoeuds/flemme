/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PrimitiveField, Primitive, PrimitiveDescriptor } from './primitive'
import type { ArrayDescriptor, ArrayField } from './array'
import type { ObjectField, ObjectDescriptor } from './object'
import { Form } from './form'
import { lazy, Lazy } from '../lib/lazy'

export type Obj = Record<string, any>
export function assign<A extends Obj, B extends Obj>(a: A, b: B): A & B
export function assign<A extends Obj, B extends Obj, C extends Obj>(a: A, b: B, c: C): A & B & C
export function assign(a: Obj, ...objects: Array<Obj>) {
  Object.defineProperties(a, {
    ...Object.assign({}, ...objects.map(Object.getOwnPropertyDescriptors)),
  })
  return a
}

// Validation
export type ValidationError = {
  message: string
  meta?: Record<string, unknown>
}
export type Validate<Value> = (value: Value | undefined | null) => ValidationError[]
export const composeValidate = <Value>(...validators: (Validate<Value> | undefined)[]): Validate<Value> => {
  return (value) => {
    for (const validate of validators) {
      const errors = validate?.(value) ?? []
      if (errors.length > 0) return errors // fail fast
    }
    return []
  }
}

// Listeners / Observable / Event system
export type Unlisten = () => void
export type Listener<Value> = (field: InferField<Value>) => void
export const baseEventNames = ['change', 'blur', 'focus', 'reset'] as const
export type BaseEventName = typeof baseEventNames[number]
export type Listeners<Value> = Record<BaseEventName, Listener<Value>[]>

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
export type Field<T> =
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
  readonly initial: Value | undefined | null
  readonly touched: boolean
  readonly visited: boolean
  readonly active: boolean
}
export type FieldRest<T extends Field<any>> = Omit<T, keyof FieldState>

// prettier-ignore
export type BaseField<Value> = {
  readonly name: string
  reset(nextInitial?: Value | undefined | null): void
  validate(): void
  on(eventName: BaseEventName, listener: Listener<Value>): Unlisten
  change(value: Value | undefined | null): void
} & FieldState<Value>

export type InjectedData = {
  path: Array<string | number>
  validateOn: Exclude<BaseEventName, 'reset'>[]
}
export type FieldFactory<Value> = (initial: Value, injected: InjectedData) => InferField<Value>

interface Internals<Value> {
  lazyUntil: <Fn extends (...args: any[]) => any>(eventNames: BaseEventName[], fn: Fn) => Lazy<Fn>
  notify: (eventName: BaseEventName) => void
  on(eventName: BaseEventName, listener: Listener<Value>): Unlisten
}
export const makeInternals = <Field extends BaseField<any>>(field: Field): Internals<Field['value']> => {
  type Value = Field['value']
  const listeners = Object.fromEntries(baseEventNames.map((eventName) => [eventName, []])) as unknown as Listeners<Value>
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
  validators?: Validate<Value>[]
  onInit?: (field: InferField<Value>) => void
  isRequired?: boolean
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
