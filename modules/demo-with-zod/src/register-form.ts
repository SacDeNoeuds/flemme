/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Form, Validate } from 'flemme'
import { z } from 'zod'
import { ensureDefined } from './lib/assert'
import { makeForm } from './lib/form'
import { sleep } from './lib/sleep'

type FormValues = {
  username: string
  password: string
  confirmation: string
}

const schema = z.object({
  username: z.string().min(4).max(233),
  password: z.string().min(4).max(233),
  confirmation: z.string().min(4).max(233),
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
  const result = schema.safeParse(values)
  if (!result.success) {
    return result.error.errors.map<ValidationError>(({ code, path, ...rest }) => ({
      code,
      path: path.join('.'),
      ...rest,
    }))
  }

  const errors: ValidationError[] = []
  if (result.data.password !== result.data.confirmation) {
    errors.push({
      code: errorCode.passwordMismatch,
      path: 'confirmation',
    })
  }
  return errors.length === 0 ? undefined : errors
}

export const registrationForm = makeForm<FormValues, ValidationError[]>({
  initial: {
    confirmation: '',
    password: '',
    username: '',
  },
  submit: async (values: FormValues) => {
    await sleep(750)
    console.info('Submitted:', values)
  },
  validate,
  validationTriggers: ['change'],
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
