import { createForm } from 'flemme-vue'
import z from 'zod'

const registrationFormValuesSchema = z
  .object({
    username: z.string().min(4).max(233),
    password: z.string().min(4).max(233),
    confirmation: z.string().min(4).max(233),
    tags: z.array(z.object({ id: z.uuid(), label: z.string() })),
  })
  .refine((values) => values.password === values.confirmation, {
    message: 'Passwords must match',
  })

export interface FormValues extends z.input<typeof registrationFormValuesSchema> {}
export interface FormParsedValues extends z.output<typeof registrationFormValuesSchema> {}

export const [useRegistrationForm, useRegistrationFormField] = createForm<FormValues, FormParsedValues>({
  schema: registrationFormValuesSchema,
  validationTriggers: ['blur'],
  defaultInitialValues: {
    username: '',
    password: '',
    confirmation: '',
    tags: [],
  }
})
