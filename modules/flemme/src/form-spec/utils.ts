import { fc } from '@fast-check/vitest'
import { z } from 'zod'
import { createForm, CreateFormOptions } from '../form'

export type Product = {
  name: string
  price: number
  createdAt: Date
  forSale: boolean
}
export type FormValues = { products: Product[]; name?: string | undefined }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const submit = (_values: FormValues): Promise<void> => Promise.resolve()

const productSchema = z.object({
  name: z.string(),
  price: z.number(),
  createdAt: z.coerce.date(),
  forSale: z.boolean(),
})
export const formValuesSchema = z.object({
  name: z.string().optional(),
  products: z.array(productSchema).min(1, 'mustProvideProducts'),
})

export const createProductForm = (options?: Partial<CreateFormOptions<FormValues, FormValues>>) =>
  createForm({
    initialValues: {
      products: [{ name: 'Guitar', createdAt: new Date(), forSale: true, price: 12 }],
    },
    schema: formValuesSchema,
    submit,
    validationTriggers: [],
    ...options,
  })

export const productArbitrary = fc.record(
  {
    name: fc.string(),
    price: fc.float(),
    createdAt: fc.date({ noInvalidDate: true }),
    forSale: fc.boolean(),
  },
  { noNullPrototype: true },
)

export const formValuesArbitrary = fc.record(
  {
    products: fc.array(productArbitrary, { minLength: 1, maxLength: 10 }),
  },
  { noNullPrototype: true },
)
