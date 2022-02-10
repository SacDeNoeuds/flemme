/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yup from 'yup'
import { type Form, type Validate } from 'flemme'
import { makeForm } from './lib/form'
import { ensureDefined } from './lib/assert'
import { sleep } from './lib/sleep'

type FormValues = {
  username: string
  password: string
  confirmation: string
}

const schema = yup.object({
  username: yup.string().min(4).max(233).required(),
  password: yup.string().min(4).max(233).required(),
  confirmation: yup.string().min(4).max(233).required(),
})

type FormError = {
  code: string
  path: string
  [Key: string]: any
}
const errorCode = {
  passwordMismatch: 'passwordMismatch',
}
const validate: Validate<FormError[], FormValues> = (values) => {
  try {
    const result = schema.validateSync(values)
    const errors: FormError[] = []
    if (result.password !== result.confirmation) {
      errors.push({
        code: errorCode.passwordMismatch,
        path: 'confirmation',
      })
    }
    return errors.length === 0 ? undefined : errors
  } catch (error) {
    if (yup.ValidationError.isError(error)) {
      return [{ code: error.type ?? 'unknown_error', path: error.path ?? '' }]
    }
    return [{ code: 'unknown_error', path: '' }]
  }
}

export const registerForm = () => {
  return makeForm<FormValues, FormError[]>({
    initial: {},
    validate,
    validationTriggers: ['change'],
  })
}

export const register = async (values: FormValues) => {
  await sleep(750)
  console.info('Submitted:', values)
}

const errorMessageByCode: Record<string, string> = {
  passwordMismatch: 'Passwords must match',
}
export const registerInput = (form: Form<FormValues, FormError[]>, name: keyof FormValues): void => {
  const input = ensureDefined(document.querySelector<HTMLInputElement>(`input[name=${name}]`), `input "${name}" should be defined`)
  const feedback = ensureDefined(document.querySelector<HTMLElement>(`small#${name}-error`), `feedback "${name}" should be defined`)

  input.addEventListener('input', () => form.change(name, input.value || undefined))
  input.addEventListener('focus', () => form.focus(name))
  input.addEventListener('blur', () => form.blur(name))

  form.on('validated', () => {
    const errors = (form.errors() ?? []).filter(({ path }) => path === name)
    const error = errors.map(({ code }) => errorMessageByCode[code.toString()] ?? `Received error code "${code}"`)
    feedback.innerText = error.join('\n')
  })
}
