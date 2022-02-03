/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PartialDeep } from 'type-fest'
import { ValidationError } from '../lib/validation'
import { ArrayField } from './array'
import { AnyField, assign, BaseField, InferDescriptor, InferField, InjectedData, Obj } from './common'
import { ObjectField } from './object'
import { backdoors, Primitive, PrimitiveField } from './primitive'

export type Form<Value> = InferField<Value> & {
  errors: FormError[]
  submit: (handler: (values: Value) => Promise<void>) => Promise<void>
}

const makeForm = <Value>(schema: InferDescriptor<Value>, validateOn: InjectedData['validateOn'], initial: PartialDeep<Value>): Form<Value> => {
  const form = {} as Form<Value>
  const field = schema.create(initial as any, { path: [], validateOn })
  const markSubFieldsAsSubmitted = () => {
    traverse(field, (field) => {
      if (!isPrimitiveField(field)) return
      const backdoor = backdoors.get(field)
      if (!backdoor) return
      backdoor.markAsSubmitted()
    })
  }
  assign(form, field, {
    get errors() {
      return getErrors(field)
    },
    submit: async (handler: (values: Value) => Promise<void>) => {
      markSubFieldsAsSubmitted()
      form.validate()
      if (isObjectField(form) || isArrayField(form)) await form.validated
      if (!form.valid) throw new Error('form is invalid')
      await handler(form.value as any)
      form.reset(form.value)
    },
  })
  return Object.seal(form) as Form<Value>
}

export type FormParams<Value> = {
  schema: InferDescriptor<Value>
  onInit?: (form: Form<Value>) => void
}
export const form = <Value>({ schema, onInit }: FormParams<Value>) => {
  return (initial: PartialDeep<Value>, { validateOn = ['blur'] }: { validateOn?: InjectedData['validateOn'] } = {}): Form<Value> => {
    const formAsEnhancedField = makeForm(schema, validateOn, initial)
    onInit?.(formAsEnhancedField)
    return formAsEnhancedField
  }
}

const isObjectField = (field: AnyField): field is ObjectField<any> => 'fields' in field && !Array.isArray(field.fields)
const isArrayField = (field: AnyField): field is ArrayField<any> => 'fields' in field && Array.isArray(field.fields)
const isPrimitiveField = (field: AnyField): field is PrimitiveField<any> => !isObjectField(field) && !isArrayField(field)

type FormError = ValidationError & { field: BaseField<any> }
const getErrors = <Value extends any[] | Obj | Primitive>(field: InferField<Value>): FormError[] => {
  if (isObjectField(field)) {
    return [...field.errors.map((error) => ({ ...error, field })), ...Object.values(field.fields ?? {}).flatMap(getErrors)]
  }
  if (isArrayField(field)) {
    return [...field.errors.map((error) => ({ ...error, field })), ...(field.fields ?? []).flatMap(getErrors)]
  }
  return field.errors.map((error) => ({ ...error, field }))
}

const traverse = (root: AnyField, mapper: (field: AnyField) => void): void => {
  const fields = isObjectField(root) || isArrayField(root) ? Object.values<AnyField>(root.fields) : null
  mapper(root)
  if (!fields) return
  fields.forEach((field) => {
    mapper(field)
    traverse(field, mapper)
  })
}
