import { createForm } from 'flemme'
import { x } from 'unhoax'
import { ensureDefined } from './lib/assert'
import { sleep } from './lib/sleep'

type FormValues = {
  username: string
  password: string
  confirmation: string
}

const schema = x
  .typed<FormValues>()
  .object({
    username: x.string.size({ min: 4, max: 233 }),
    password: x.string.size({ min: 4, max: 233 }),
    confirmation: x.string.size({ min: 4, max: 233 }),
  })
  .refine('passwordMustMatch', (values) => values.password === values.confirmation)

export const form = createForm({
  initialValues: {
    username: '',
    password: '',
    confirmation: '',
  },
  validationTriggers: ['change', 'blur'],
  schema,
  submit: async (values: FormValues) => {
    await sleep(750)
    console.info('Submitted:', values)
  },
})

console.debug(
  'TEST',
  schema.parse({
    username: '',
    password: '',
    confirmation: '',
  }),
)

export const registerInput = (name: keyof FormValues): void => {
  const input = ensureDefined(
    document.querySelector<HTMLInputElement>(`input[name=${name}]`),
    `input "${name}" should be defined`,
  )
  const feedback = ensureDefined(
    document.querySelector<HTMLElement>(`small#${name}-error`),
    `feedback "${name}" should be defined`,
  )

  input.addEventListener('input', () => form.set(name, input.value || undefined))
  input.addEventListener('focus', () => form.focus(name))
  input.addEventListener('blur', () => form.blur(name))

  form.on('validated', () => {
    if (!form.isTouchedAt(name)) return
    console.debug('form errors', form.errors)
    const errorMessage = (form.errors ?? [])
      .filter(({ path }) => path === name)
      .map((error) => error.message)
      .join('\n')

    requestAnimationFrame(() => {
      feedback.textContent = errorMessage
    })
  })
}
