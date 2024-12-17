/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Form, type Validate } from 'flemme'
import { type Describe, object, size, string } from 'superstruct'
import { ensureDefined } from './lib/assert'
import { makeForm } from './lib/form'
import { sleep } from './lib/sleep'

type FormValues = {
  username: string
  password: string
  confirmation: string
}

const schema: Describe<FormValues> = object({
  username: size(string(), 4, 233),
  password: size(string(), 4, 233),
  confirmation: size(string(), 4, 233),
})

type ValidationError = {
  code: string
  path: string
  [Key: string]: any
}
const errorCode = {
  passwordMismatch: 'passwordMismatch',
}
const validate: Validate<ValidationError[], FormValues> = (values) => {
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

export const registrationForm = makeForm<FormValues, ValidationError[]>({
  initial: {
    username: '',
    password: '',
    confirmation: '',
  },
  validate,
  validationTriggers: ['change'],
  submit: async (values: FormValues) => {
    await sleep(750)
    console.info('Submitted:', values)
    const output = ensureDefined(document.querySelector<HTMLElement>('#output'), 'output should be defined')
    output.innerText = JSON.stringify(values, null, 2)
  },
})

const errorMessageByCode: Record<string, string> = {
  passwordMismatch: 'Passwords must match',
}
export const registerInput = (form: Form<FormValues, ValidationError[]>, name: keyof FormValues): void => {
  const input = ensureDefined(
    document.querySelector<HTMLInputElement>(`input[name=${name}]`),
    `input "${name}" should be defined`,
  )
  const feedback = ensureDefined(
    document.querySelector<HTMLElement>(`small#${name}-error`),
    `feedback "${name}" should be defined`,
  )

  input.addEventListener('input', () => form.change(name, input.value || undefined))
  input.addEventListener('focus', () => form.focus(name))
  input.addEventListener('blur', () => form.blur(name))

  form.on('validated', () => {
    const errors = (form.errors() ?? []).filter(({ path }) => path === name)
    const error = errors.map(({ code }) => errorMessageByCode[code.toString()] ?? `Received error code "${code}"`)
    feedback.innerText = error.join('\n')
  })
}
