import { createForm } from 'flemme-vue'
import z from 'zod'

interface UserTag {
  id: string
  label: string
}

export interface FormValues {
  username: string
  password: string
  confirmation: string
  tags: UserTag[]
}

const registrationFormValuesSchema = z
  .object({
    username: z.string().min(4).max(233),
    password: z.string().min(4).max(233),
    confirmation: z.string().min(4).max(233),
    tags: z.array(z.object({ id: z.uuid(), label: z.string() })),
  })
  .refine((values) => values.password === values.confirmation, {
    message: 'Passwords must match',
  }) satisfies z.ZodType<FormValues, FormValues>

export const [useRegistrationForm, useRegistrationFormField] = createForm<FormValues>({
  schema: registrationFormValuesSchema,
  validationTriggers: ['blur'],
  defaultInitialValues: {
    username: '',
    password: '',
    confirmation: '',
    tags: [],
  },
})
