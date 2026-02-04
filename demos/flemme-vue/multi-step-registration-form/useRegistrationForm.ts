import { createForm } from 'flemme-vue'
import z from 'zod'

export interface FormValues {
  // step 1
  account: {
    email: string
    password: string
  }
  // step 2
  profile: {
    firstName: string
    lastName: string
  }
  // step 3
  billingAddress: {
    street: string
    city: string
  }
}

const registrationFormValuesSchema = z.object({
  account: z.object({
    email: z.email(),
    password: z.string().min(4),
  }),
  profile: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }),
  billingAddress: z.object({
    street: z.string().min(4),
    city: z.string().min(4),
  }),
}) satisfies z.ZodType<FormValues, FormValues>

export const [useRegistrationForm, useRegistrationFormField] = createForm<FormValues>({
  schema: registrationFormValuesSchema,
  validationTriggers: ['blur'],
  defaultInitialValues: {
    // step 1
    account: {
      email: '',
      password: '',
    },
    // step 2
    profile: {
      firstName: '',
      lastName: '',
    },
    // step 3
    billingAddress: {
      street: '',
      city: '',
    },
  },
})
