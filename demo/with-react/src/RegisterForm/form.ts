/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Describe, object, size, string, array } from 'superstruct'
import { type Validate } from 'flemme'
import { type PartialDeep } from 'type-fest'
import { makeForm } from '../lib/form'
import { sleep } from '../lib/sleep'

export type FormValues = {
  username: string
  password: string
  confirmation: string
  requirements: string[]
}

const schema: Describe<FormValues> = object({
  username: size(string(), 4, 233),
  password: size(string(), 4, 233),
  confirmation: size(string(), 4, 233),
  requirements: array(size(string(), 6, 20)),
})

export type ValidationError = {
  code: string
  path: string
  [Key: string]: any
}
const errorCode = {
  passwordMismatch: 'passwordMismatch',
}
const validate: Validate<ValidationError[], FormValues> = (values) => {
  // console.info('validate', values)
  const [structErrors] = schema.validate(values)
  if (structErrors) {
    return structErrors.failures().map<ValidationError>((failure) => ({
      code: failure.refinement ?? failure.type,
      path: failure.path.join('.'),
      failure,
    }))
  }
  schema.assert(values)

  const errors: ValidationError[] = []
  if (values.password !== values.confirmation) {
    errors.push({
      code: errorCode.passwordMismatch,
      path: 'confirmation',
    })
  }
  return errors.length === 0 ? undefined : errors
}

export const registerForm = (initial: PartialDeep<FormValues> = {}) => {
  return makeForm<FormValues, ValidationError[]>({
    initial,
    validate,
    validationTriggers: ['change'],
  })
}

export const register = async (values: FormValues) => {
  await sleep(750)
  console.info('Submitted:', values)
}
