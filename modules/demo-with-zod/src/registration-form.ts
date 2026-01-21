/* eslint-disable @typescript-eslint/no-explicit-any */
import { createForm } from 'flemme'
import { z } from 'zod'
import { ensureDefined } from './lib/assert'
import { sleep } from './lib/sleep'

type FormValues = {
  username: string
  password: string
  confirmation: string
}

const schema = z
  .object({
    username: z.string().min(4).max(233),
    password: z.string().min(4).max(233),
    confirmation: z.string().min(4).max(233),
  })
  .refine((values) => values.password === values.confirmation, {
    message: 'Passwords must match',
  })

export const form = createForm({
  initialValues: {
    confirmation: '',
    password: '',
    username: '',
  },
  schema,
  validationTriggers: ['change', 'blur'],
  submit: async (values) => {
    await sleep(750)
    console.info('Submitted:', values)
  },
})

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
    requestAnimationFrame(() => {
      feedback.textContent = (form.errors ?? [])
        .filter(({ path }) => path === name)
        .map((error) => error.message)
        .join('\n')
    })
  })
}
