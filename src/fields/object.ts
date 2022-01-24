/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil, Validate, ValidateAsync, ValidationError, composeValidate } from '../lib/validation'
import { assign, BaseDescriptor, baseEventNames, BaseField, Descriptor, FieldRest, FieldState, InferDescriptor, InferField, InjectedData, makeInternals, Obj } from './common'

export type ObjectField<Value extends Obj | undefined | null> = BaseField<Value> & {
  readonly fields: Value extends Obj ? { [Key in keyof Value]: InferField<Value[Key]> } : Extract<Value, undefined | null>
  readonly validated: Promise<void> // for validateAsync
}

const makeObjectField = <Value extends Obj | undefined | null>(
  factories: { [Key in keyof Value]: InferDescriptor<Value[Key]> },
  initial: Value | undefined | null,
  validators: Validate<Value>[] = [],
  injected: InjectedData,
  validateAsync?: ValidateAsync<Value>,
  onFieldsCreated?: (field: ObjectField<Value>) => void,
): ObjectField<Value> => {
  const validateOn = new Set(injected.validateOn) // removes duplicates
  const validate = composeValidate(...validators)
  const field = {} as ObjectField<Value> // create reference of field, populate it later
  const internals = makeInternals(field)
  /** Field-level "errors" */
  let errors: ValidationError[] = []
  /** Field-level "touched" */
  let touched = false
  let validated = Promise.resolve()
  let activeValidated = validated
  let fields: { [Key in keyof Value]: InferField<Value[Key]> } | undefined | null

  const getValue = internals.lazyUntil(['change', 'reset'], () => {
    if (!field.fields) return field.fields as Extract<Value, undefined | null>
    const entries = Object.entries(field.fields).map(([key, f]) => [key, f.value]) as [keyof Value, Value[]][]
    return Object.fromEntries(entries) as Exclude<Value, undefined | null>
  })
  const isValid = internals.lazyUntil([...validateOn, 'reset'], () => field.errors.length === 0 && !some((field) => !field.valid))
  const isDirty = internals.lazyUntil(['change', 'reset'], () => {
    const value = field.value
    if (isNil(initial) || isNil(value)) return value !== initial
    else return some((field) => field.dirty)
  })
  const isTouched = internals.lazyUntil(['change', 'reset'], () => touched || some((field) => field.touched))
  const isVisited = internals.lazyUntil(['focus'], () => some((field) => field.visited))
  const isActive = internals.lazyUntil(['focus', 'blur'], () => some((field) => field.active))

  assign<any, FieldState<Value>, FieldRest<ObjectField<Value | undefined | null>>>(
    field,
    {
      get value() {
        return getValue()
      },
      get initial() {
        return initial
      },
      get errors() {
        return errors
      },
      get valid() {
        return isValid()
      },
      get dirty() {
        return isDirty()
      },
      get pristine() {
        return !field.dirty
      },
      get touched() {
        return isTouched()
      },
      get visited() {
        return isVisited()
      },
      get active() {
        return isActive()
      },
    } as FieldState<Value>,
    {
      get name() {
        return injected.path.join('.')
      },
      get fields() {
        return fields as any
      },
      get validated() {
        return validated
      },

      reset: (nextInitial = field.initial): void => {
        initial = nextInitial
        setFields(nextInitial)
        touched = false
        internals.notify('reset')
      },

      change: (value: Value): void => {
        if (value) {
          if (!fields) setFields({} as Value, value)
          map((field, key): void => {
            if (value.hasOwnProperty(key)) field.change(value[key as any])
          })
        } else {
          // value is nil here
          fields = value
          touched = true
          internals.notify('change')
        }
      },
      on: (eventName, listener) => internals.on(eventName, listener),

      validate: () => {
        errors = validate(field.value)
        map((field) => field.validate())
        if (isNil(field.value) || errors.length > 0 || !validateAsync) return
        activeValidated = validated = validateAsync(field.value).then((err) => {
          if (activeValidated !== validated) return
          errors = [...errors, ...err]
          isValid.flush()
        })
      },
    },
  )

  setup()

  return Object.seal(field)

  function forwardFieldEvents(fields: { [Key in keyof Value]: InferField<Value[Key]> }) {
    Object.values(fields).forEach((innerField: any) => {
      baseEventNames.forEach((eventName) => innerField.on(eventName, () => internals.notify(eventName)))
    })
  }

  function setup() {
    setFields(initial)
    // Set listeners
    if (field.fields) forwardFieldEvents(field.fields as any)
    validateOn.forEach((eventName) => {
      field.on(eventName, () => {
        errors = validate(field.value)
      })
    })
    // initialize
    field.reset(initial)
  }
  function map<T>(mapper: <K extends keyof Value>(value: InferField<Value[K]>, key: K) => T): T[] {
    return Object.entries(field.fields ?? {}).map(([key, value]: any) => mapper(value, key)) as any
  }
  function some(mapper: <K extends keyof Value>(value: InferField<Value[K]>, key: K) => any): boolean {
    return Object.entries(field.fields ?? {}).some(([key, value]: any) => mapper(value, key))
  }

  function setFields(value: Value | undefined | null, changeWith?: Value) {
    fields = createFields(value)
    if (changeWith) field.change(changeWith)
    if (fields) onFieldsCreated?.(field)
  }

  function createFields(value: Value | undefined | null) {
    if (!value) return value && (undefined as Extract<Value, undefined | null>)
    const entries = (Object.entries(factories) as Array<[string, Descriptor<any>]>).map(([key, descriptor]) => {
      return [key, descriptor.create(value[String(key)], { ...injected, path: [...injected.path, key] })]
    })
    const created = Object.fromEntries(entries) as { [Key in keyof Value]: InferField<Value[Key]> }
    const sealed = Object.seal(created)
    forwardFieldEvents(sealed)
    return sealed
  }
}

export interface ObjectDescriptor<T extends Obj | undefined | null> extends BaseDescriptor<T> {
  type: 'object'
  fields: { [Key in keyof T]: InferDescriptor<T[Key]> }
}

export type ObjectParams<Value extends Obj | undefined | null> = {
  validators?: Validate<Value>[]
  validateAsync?: ValidateAsync<Value>
  onInit?: (field: InferField<Value>) => void
}
export const object = <Value extends Obj>(
  fields: ObjectDescriptor<Value>['fields'],
  { validators = [], validateAsync, onInit }: ObjectParams<Value> = {},
): ObjectDescriptor<Value> => ({
  type: 'object',
  fields,
  onInit,
  validators,
  create(initial, injected) {
    return makeObjectField(this.fields, initial, this.validators, injected, validateAsync, this.onInit as any) as InferField<Value>
  },
})

const merge2 = <A extends Obj, B extends Obj>(a: ObjectDescriptor<A>, b: ObjectDescriptor<B>): ObjectDescriptor<A & B> => {
  const fields = {
    ...a.fields,
    ...b.fields,
  } as ObjectDescriptor<A & B>['fields']
  return object<A & B>(fields, {
    onInit: (field) => {
      a.onInit?.(field)
      b.onInit?.(field)
    },
    validators: [...(a.validators ?? []), ...(b.validators ?? [])],
  })
}

export function merge<A extends Obj, B extends Obj>(a: ObjectDescriptor<A>, b: ObjectDescriptor<B>): ObjectDescriptor<A & B>
export function merge<A extends Obj, B extends Obj, C extends Obj>(a: ObjectDescriptor<A>, b: ObjectDescriptor<B>, c: ObjectDescriptor<C>): ObjectDescriptor<A & B & C>
export function merge<A extends Obj, B extends Obj, C extends Obj, D extends Obj>(
  a: ObjectDescriptor<A>,
  b: ObjectDescriptor<B>,
  c: ObjectDescriptor<C>,
  d: ObjectDescriptor<D>,
): ObjectDescriptor<A & B & C>
export function merge(toEnhance: ObjectDescriptor<any>, ...descriptors: ObjectDescriptor<any>[]): ObjectDescriptor<Obj> {
  let enhanced = toEnhance
  for (const descriptor of descriptors) {
    enhanced = merge2(enhanced, descriptor)
  }
  return enhanced
}
