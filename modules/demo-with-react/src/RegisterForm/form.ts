import type { Validate } from 'flemme'
import pipe from 'just-pipe'
import * as x from 'unhoax'
import { makeForm } from '../lib/form'

export type FormValues = {
  username: string
  password: string
  confirmation: string
  requirements: string[] | undefined
}

const schema = x.object<FormValues>({
  username: pipe(x.string, x.size({ min: 4, max: 233 })),
  password: pipe(x.string, x.size({ min: 4, max: 233 })),
  confirmation: pipe(x.string, x.size({ min: 4, max: 233 })),
  requirements: pipe(x.string, x.size({ min: 3, max: 20 }), x.array, x.optional),
})

export type ValidationError = {
  message: string
  path: string
}
const validate: Validate<ValidationError[], FormValues> = (values) => {
  const result = schema.parse(values)
  if (!result.success) {
    return result.error.issues.map<ValidationError>((failure) => ({
      message: failure.refinement ?? failure.schemaName,
      path: failure.path.join('.'),
    }))
  }

  const errors: ValidationError[] = []
  if (values.password !== values.confirmation) {
    errors.push({
      message: 'Passwords must match',
      path: 'confirmation',
    })
  }
  return errors.length === 0 ? undefined : errors
}

export const createRegistrationForm = (options: {
  initialValues?: FormValues
  submit: (values: FormValues) => Promise<unknown>
}) => {
  return makeForm<FormValues, ValidationError[]>({
    initial: options?.initialValues ?? {
      username: '',
      password: '',
      confirmation: '',
      requirements: undefined,
    },
    validate,
    validationTriggers: ['change'],
    submit: options.submit,
  })
}
