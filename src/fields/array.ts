/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validator, ValidateAsync, ValidationError, composeValidate, isNil } from '../lib/validation'
import {
  assign,
  BaseDescriptor,
  BaseField,
  bubblingEvents,
  Descriptor,
  FieldRest,
  FieldState,
  InferDescriptor,
  InferField,
  InferValue,
  InjectedData,
  makeInternals,
  Obj,
} from './common'

export type ArrayFieldInput<T = any> = T[] | undefined | null

type MapIfObj<O, T> = O extends Obj ? { [Key in keyof Obj]: MapIfObj<Obj[Key], T> } : O | T

export type ArrayField<Value extends any[] | undefined | null> = BaseField<Value> & {
  fields: Value extends any[] ? InferField<Value[number]>[] : Extract<Value, null | undefined>
  validated: Promise<void> // for validateAsync
  add(item: MapIfObj<NonNullable<Value>[number], undefined>, index?: number): void
  remove(index: number): void
  move(index: number, targetIndex: number): void
}

const makeArrayField = <Value extends any[] | undefined | null>(
  item: InferDescriptor<NonNullable<Value>[number]>,
  initial: Value | undefined | null,
  validators: Validator<Value>[] = [],
  injected: InjectedData,
  required: boolean,
  validateAsync?: ValidateAsync<Value>,
): ArrayField<Value> => {
  type ItemValue = NonNullable<Value>[number]
  const validateOn = new Set(injected.validateOn) // removes duplicates
  const validate = composeValidate(...validators)

  const field = {} as ArrayField<Value>
  const internals = makeInternals(field)
  let fields: InferField<ItemValue>[] | undefined | null
  /** field-level "errors" */
  let errors: ValidationError[] = []
  /** field-level "touched" */
  let touched = false
  let validated = Promise.resolve()
  let activeValidated = validated

  const getValue = internals.lazyUntil(['change', 'reset'], () => (field.fields ? field.fields.map((f) => f.value) : field.fields) as Value)
  const isValid = internals.lazyUntil(
    ['reset', 'validated', 'change'], // watch 'change' because of array operations like add & remove
    () => field.errors.length === 0 && (field.fields ?? []).every((field) => field.valid),
  )
  const isDirty = internals.lazyUntil(['change', 'reset'], () => isSelfDirty() || (field.fields?.some((field) => field.dirty) ?? false))
  const isTouched = internals.lazyUntil(['change', 'reset', 'validated'], () => touched || (field.fields?.some((field) => field.touched) ?? false))
  const isVisited = internals.lazyUntil(['focus', 'validated'], () => field.fields?.some((field) => field.visited) ?? false)
  const isActive = internals.lazyUntil(['focus', 'blur'], () => field.fields?.some((field) => field.active) ?? false)
  const getValidated = internals.lazyUntil(['validateAsync'], () => {
    return Promise.all([validated, ...(fields ?? []).map((field: any) => field.validated).filter(Boolean)]).then(() => void 0)
  })

  assign<any, FieldState<Value>, FieldRest<ArrayField<Value | undefined | null>>>(
    field,
    {
      get initial() {
        return initial
      },
      get value() {
        return getValue()
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
      get required() {
        return required
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
        return getValidated()
      },

      reset: (nextInitial = field.initial) => {
        initial = nextInitial
        fields = initial?.map((initial, index) => createItemField(initial, index)) ?? initial
        touched = false
        internals.notify('reset')
      },
      change: (value) => {
        if (!value || value.length === 0) {
          fields = value
          touched = true
          internals.notify('change')
          return
        }
        if (!fields) fields = []
        if (fields.length > value.length) fields.length = value.length // remove elements
        value.forEach((item, index) => {
          if (!fields) throw new Error('impossible mutation')
          if (fields[index]) fields[index].change(item as any)
          else {
            fields[index] = createItemField(undefined, index)
            fields[index].change(item)
          }
        })
        touched = true
      },
      on: (eventName, listener) => internals.on(eventName, listener),
      validate: () => {
        validateSelf()
        fields?.map((f) => f.validate())
      },
      add: (item) => {
        if (!field.value) throw new Error('cannot add item to undefined value')
        field.change([...(field.value as any[]), item] as Value)
        // 'change' will be triggered by created field
      },
      remove: (index) => {
        if (!field.value) throw new Error('cannot remote item to undefined value')
        field.change(field.value.filter((_, i) => i !== index) as Value)
        internals.notify('change')
      },
      move: (index, targetIndex) => {
        const current = field.value
        if (!current) throw new Error('cannot move when value is not an array')
        if (targetIndex < 0 || targetIndex >= current.length) throw new Error(`Out of bound target index ${targetIndex}`)
        if (index < 0) throw new Error(`Out of bound index ${index}`)
        const [item] = current.splice(index, 1)
        if (!item) throw new Error(`Out of bound index ${index}`)
        const next = [...current.slice(0, targetIndex), item, ...current.slice(targetIndex)]
        field.change(next as Value)
      },
    },
  )

  setup()
  return Object.seal(field)

  function setup() {
    validateOn.forEach((eventName) => {
      field.on(eventName, validateSelf)
    })
    field.reset(initial)
  }

  function createItemField(itemValue: ItemValue | undefined, index: number): InferField<ItemValue> {
    const itemField = item.create(itemValue as ItemValue, { ...injected, path: [...injected.path, index] })
    bubblingEvents.forEach((eventName) => itemField.on(eventName, () => internals.notify(eventName)))
    return itemField as any
  }

  function isSelfDirty() {
    if (!field.initial) return field.initial !== field.fields
    if (!field.fields) return field.fields !== field.initial
    return field.initial.length !== field.fields.length
  }
  function validateSelf() {
    errors = validate(field.value)
    if (isNil(field.value) || errors.length > 0 || !validateAsync) return internals.notify('validated')
    activeValidated = validated = validateAsync(field.value).then((err) => {
      if (activeValidated !== validated) return
      errors = err
      internals.notify('validated')
    })
    internals.notify('validateAsync')
  }
}

export interface ArrayDescriptor<T extends any[] | undefined | null> extends BaseDescriptor<T> {
  type: 'array'
  item: InferDescriptor<NonNullable<T>[number]>
}

export type ArrayParams<D extends Descriptor<any>> = {
  validators?: Validator<InferValue<D>[]>[]
  validateAsync?: ValidateAsync<InferValue<D>[]>
  onInit?: (field: ArrayField<InferValue<D>[]>) => void
}
export const array = <D extends Descriptor<any>>(item: D, { validators, validateAsync, onInit }: ArrayParams<D> = {}): ArrayDescriptor<InferValue<D>[]> => ({
  type: 'array',
  onInit: onInit as any,
  validators,
  item: item as any,
  isRequired: true,
  create(initial, injected): InferField<InferValue<D>[]> {
    const field = makeArrayField(this.item, initial, this.validators, injected, this.isRequired, validateAsync) as InferField<InferValue<D>[]>
    this.onInit?.(field)
    return field
  },
})
