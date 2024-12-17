import type { Form, Validate } from 'flemme'
import pipe from 'just-pipe'
import * as x from 'unhoax'
import { ensureDefined } from './lib/assert'
import { makeForm } from './lib/form'
import { sleep } from './lib/sleep'

type FormValues = {
  username: string
  password: string
  confirmation: string
}

const schema = x.object({
  username: pipe(x.string, x.size({ min: 4, max: 233 })),
  password: pipe(x.string, x.size({ min: 4, max: 233 })),
  confirmation: pipe(x.string, x.size({ min: 4, max: 233 })),
})

type ValidationError = {
  path: string
  message: string
}
const validate: Validate<ValidationError[], FormValues> = (values) => {
  const result = schema.parse(values)
  if (!result.success) {
    return result.error.issues.map<ValidationError>(({ path, schemaName, refinement }) => ({
      path: path.join('.'),
      message: refinement || schemaName,
    }))
  }

  const errors: ValidationError[] = []
  if (result.value.password !== result.value.confirmation) {
    errors.push({
      path: 'confirmation',
      message: 'passwords must match',
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
  submit: async (values: FormValues) => {
    await sleep(750)
    console.info('Submitted:', values)
  },
  validate,
  validationTriggers: ['change'],
})

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
    const error = errors.map(({ message }) => message)
    feedback.innerText = error.join('\n')
  })
}
