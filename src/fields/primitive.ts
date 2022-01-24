/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validate, ValidationError, composeValidate, isDate, mustBeNotNil } from '../lib/validation'
import { assign, BaseDescriptor, BaseField, FieldRest, FieldState, InferField, InjectedData, makeInternals } from './common'

export type Primitive = string | number | boolean | Date

export type PrimitiveField<Value extends Primitive | undefined | null> = BaseField<Value> & {
  readonly active: boolean
  focus(): void
  blur(): void
}

const isPrimitiveEqual = <T extends Primitive | undefined | null>(a: T, b: T): boolean => {
  if (isDate(a) && isDate(b)) return a.valueOf() === b.valueOf()
  return a === b
}
const makePrimitiveField = <Value extends Primitive | undefined | null>(
  initial: Value | undefined | null,
  validators: Validate<Value>[] = [],
  injected: InjectedData,
  isRequired = true,
): PrimitiveField<Value> => {
  const validateOn = new Set(injected.validateOn)
  const validate = composeValidate(isRequired ? mustBeNotNil() : undefined, ...validators)
  let errors: ValidationError[] = []
  let value: Value | undefined | null = initial
  let touched = false
  let visited = false
  let active = false

  const field = {} as PrimitiveField<Value> // create reference of field, populate it later
  const internals = makeInternals(field)

  assign<any, FieldState<Value>, FieldRest<PrimitiveField<Value | undefined | null>>>(
    field,
    {
      get initial() {
        return initial as Value
      },
      get value() {
        return value as Value
      },
      get errors() {
        return errors
      },
      get valid() {
        return field.errors.length === 0
      },
      get pristine() {
        return isPrimitiveEqual(initial, value)
      },
      get dirty() {
        return !field.pristine
      },
      get touched() {
        return touched
      },
      get visited() {
        return visited
      },
      get active() {
        return active
      },
    } as FieldState<Value>,
    {
      get name() {
        return injected.path.join('.')
      },
      blur: () => {
        active = false
        internals.notify('blur')
      },
      focus: () => {
        active = true
        visited = true
        internals.notify('focus')
      },
      change: (nextValue) => {
        value = nextValue
        touched = true
        // modified = true
        internals.notify('change')
      },
      validate: () => {
        errors = validate(field.value)
      },
      on: (eventName, listener) => internals.on(eventName, listener),
      reset: (nextInitial = field.initial) => {
        initial = nextInitial
        value = nextInitial
        errors = []
        touched = false
        visited = false
        active = false
        internals.notify('reset')
      },
    },
  )
  setup()
  return Object.seal(field)

  function setup() {
    field.reset(initial as Value)
    validateOn.forEach((eventName) => field.on(eventName, () => field.validate()))
  }
}

export interface PrimitiveDescriptor<T extends Primitive | undefined | null> extends BaseDescriptor<T> {
  type: 'primitive'
}

export const primitive = <T extends Primitive>(...validators: Validate<T>[]): PrimitiveDescriptor<T> => ({
  type: 'primitive',
  validators,
  create(initial, injected): InferField<T> {
    return makePrimitiveField(initial, this.validators, injected, this.isRequired) as InferField<T>
  },
})
