/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrayField } from './array'
import { assign, BaseField, InferDescriptor, InferField, InjectedData, makeInternals, Obj, ValidationError } from './common'
import { ObjectField } from './object'
import { Primitive } from './primitive'

export type Form<Value> = InferField<Value> & {
  errors: FormError[]
}

const makeForm = <Value>(schema: InferDescriptor<Value>, validateOn: InjectedData['validateOn'], initial: Value): Form<Value> => {
  const form = {} as Form<Value>
  const field = schema.create(initial as any, { path: [], validateOn })
  const internals = makeInternals(form)
  const lazyGetErrors = internals.lazyUntil([], () => getErrors(field))
  assign(form, field, {
    get errors() {
      return lazyGetErrors()
    },
  })
  return Object.seal(form) as Form<Value>
}

export type FormParams<Value> = {
  schema: InferDescriptor<Value>
  validateOn?: InjectedData['validateOn']
  onInit?: (form: Form<Value>) => void
}
export const form = <Value>({ schema, validateOn = ['blur'], onInit }: FormParams<Value>) => {
  return (initial: Value): Form<Value> => {
    const formAsEnhancedField = makeForm(schema, validateOn, initial)
    onInit?.(formAsEnhancedField)
    return formAsEnhancedField
  }
}

const isObjectField = (field: InferField<any>): field is ObjectField<any> => 'fields' in field && !Array.isArray(field.fields)
const isArrayField = (field: InferField<any>): field is ArrayField<any> => 'fields' in field && Array.isArray(field.fields)

type FormError = ValidationError & { field: BaseField<any> }
const getErrors = <Value extends any[] | Obj | Primitive>(field: InferField<Value>): FormError[] => {
  if (isObjectField(field)) return Object.values(field.fields ?? {}).flatMap(getErrors)
  if (isArrayField(field)) return (field.fields ?? []).flatMap(getErrors)
  return field.errors.map((error) => ({ ...error, field }))
}
