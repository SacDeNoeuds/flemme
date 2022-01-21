/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrayField } from './array'
import { assign, BaseField, InferDescriptor, InferField, Obj, ValidationError } from './common'
import { ObjectField } from './object'
import { Primitive } from './primitive'

export type SubmitState = 'NotAsked' | 'Invalid' | 'Pending' | 'Failure' | 'Success'
export type Form<Value> = InferField<Value> & {
  readonly submitState: SubmitState
  setSubmitState(state: SubmitState): void
  errors: FormError[]
}

const makeForm = <Value>(schema: InferDescriptor<Value>, initial: Value): Form<Value> => {
  let submitState: SubmitState = 'NotAsked'
  const form = {} as Form<Value>
  const field = schema.create(initial as any, { path: [] })
  assign(form, field, {
    get submitState() {
      return submitState
    },
    setSubmitState: (state: SubmitState) => {
      submitState = state
      if (state === 'Success') form.reset(form.value as any)
    },
    get errors() {
      return getErrors(field)
    },
  })
  return Object.seal(form) as Form<Value>
}

export type FormParams<Value> = {
  schema: InferDescriptor<Value>
  onInit?: (form: Form<Value>) => void
}
export const form = <Value>({ schema, onInit }: FormParams<Value>) => {
  return (initial: Value): Form<Value> => {
    const formAsEnhancedField = makeForm(schema, initial)
    onInit?.(formAsEnhancedField)
    return formAsEnhancedField
  }
}

const isObjectField = (field: InferField<any>): field is ObjectField<any> => 'fields' in field && !Array.isArray(field.fields)
const isArrayField = (field: InferField<any>): field is ArrayField<any> => 'fields' in field && Array.isArray(field.fields)

type FormError = ValidationError & { field: BaseField<any> }
const getErrors = <Value extends any[] | Obj | Primitive>(field: InferField<Value>): FormError[] => {
  if (isObjectField(field)) return Object.values(field.fields ?? {}).flatMap((f) => getErrors(f))
  if (isArrayField(field)) return (field.fields ?? []).flatMap(getErrors)
  return field.errors.map((error) => ({ ...error, field }))
}
