/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy } from '../lib/lazy'
import {
  assign,
  BaseDescriptor,
  baseEventNames,
  BaseField,
  composeValidate,
  Descriptor,
  FieldRest,
  FieldState,
  InferDescriptor,
  InferField,
  InferValue,
  InjectedData,
  makeInternals,
  Validate,
  ValidationError,
} from './common'

export type ArrayFieldInput<T = any> = T[] | undefined | null

export type ArrayField<Value extends any[] | undefined | null> = BaseField<Value> & {
  fields: Value extends any[] ? InferField<Value[number]>[] : Extract<Value, null | undefined>
  add(item: NonNullable<Value>[number], index?: number): void
  remove(index: number): void
  move(index: number, targetIndex: number): void
}

const makeArrayField = <Value extends any[] | undefined | null>(
  item: InferDescriptor<NonNullable<Value>[number]>,
  initial: Value | undefined | null,
  validators: Validate<Value>[] = [],
  injected: InjectedData,
): ArrayField<Value> => {
  type ItemValue = NonNullable<Value>[number]
  const validate = composeValidate(...validators)

  const field = {} as ArrayField<Value>
  const internals = makeInternals(field)
  let fields: InferField<ItemValue>[] | undefined | null
  /** field-level "errors" */
  let errors: ValidationError[] = []
  /** field-level "touched" */
  let touched = false

  const untilChangeOrReset = {
    getValue: lazy(() => (field.fields ? field.fields.map((f) => f.value) : field.fields) as Value),
    isValid: lazy(() => field.errors.length === 0 && (field.fields ?? []).every((field) => field.valid)),
    isDirty: lazy(() => isSelfDirty() || (field.fields?.some((field) => field.dirty) ?? false)),
    isTouched: lazy(() => touched || (field.fields?.some((field) => field.touched) ?? false)),
  }
  const untilFocusOrBlur = {
    isVisited: lazy(() => field.fields?.some((field) => field.visited) ?? false),
    isActive: lazy(() => field.fields?.some((field) => field.active) ?? false),
  }
  const flushOnChange = () => Object.values(untilChangeOrReset).forEach((value) => value.flush())
  internals.on('change', flushOnChange)
  internals.on('reset', flushOnChange)
  const flushOnFocusBlur = () => Object.values(untilFocusOrBlur).forEach((value) => value.flush())
  internals.on('focus', flushOnFocusBlur)
  internals.on('blur', flushOnFocusBlur)

  assign<any, FieldState<Value>, FieldRest<ArrayField<Value | undefined | null>>>(
    field,
    Object.defineProperties({} as FieldState<Value>, {
      initial: { get: () => initial, enumerable: true },
      value: { get: () => untilChangeOrReset.getValue(), enumerable: true },
      errors: { get: () => errors, enumerable: true },
      valid: { get: () => untilChangeOrReset.isValid(), enumerable: true },
      dirty: { get: () => untilChangeOrReset.isDirty(), enumerable: true },
      pristine: { get: () => !field.dirty, enumerable: true },
      touched: { get: () => untilChangeOrReset.isTouched(), enumerable: true },
      visited: { get: () => untilFocusOrBlur.isVisited(), enumerable: true },
      active: { get: () => untilFocusOrBlur.isActive(), enumerable: true },
    }),
    {
      get name() {
        return injected.path.join('.')
      },
      get fields() {
        return fields as any
      },

      reset: (nextInitial = field.initial) => {
        initial = nextInitial
        fields = initial?.map((initial, index) => createItemField(initial, index)) ?? initial
        touched = false
        field.validate()
        internals.notify('reset')
      },
      change: (value) => {
        if (!value) {
          fields = value
          touched = true
          return
        }
        if (!fields) fields = []
        fields.length = value.length
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
        errors = validate(field.value)
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
    field.reset(initial)
  }

  function createItemField(itemValue: ItemValue | undefined, index: number): InferField<ItemValue> {
    const itemField = item.create(itemValue as ItemValue, { path: [...injected.path, index] })
    baseEventNames.forEach((eventName) => itemField.on(eventName, () => internals.notify(eventName)))
    return itemField as any
  }

  function isSelfDirty() {
    if (!field.initial) return field.initial !== field.fields
    if (!field.fields) return field.fields !== field.initial
    return field.initial.length !== field.fields.length
  }
}

export interface ArrayDescriptor<T extends any[] | undefined | null> extends BaseDescriptor<T> {
  type: 'array'
  item: InferDescriptor<NonNullable<T>[number]>
}

export type ArrayParams<D extends Descriptor<any>> = {
  validators?: Validate<InferValue<D>[]>[]
  onInit?: (field: ArrayField<InferValue<D>[]>) => void
}
export const array = <D extends Descriptor<any>>(item: D, { validators, onInit }: ArrayParams<D> = {}): ArrayDescriptor<InferValue<D>[]> => ({
  type: 'array',
  onInit: onInit as any,
  validators,
  item: item as any,
  create(initial, injected): InferField<InferValue<D>[]> {
    const field = makeArrayField(this.item, initial, this.validators, injected) as InferField<InferValue<D>[]>
    this.onInit?.(field)
    return field
  },
})
