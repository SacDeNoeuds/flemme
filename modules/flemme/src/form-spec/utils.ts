import { fc } from '@fast-check/vitest'
import { Validate } from '../form'

export type Product = {
  name: string
  price: number
  createdAt: Date
  forSale: boolean
}
export type FormValues = { products: Product[]; name?: string }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const submit = (_values: FormValues): Promise<void> => Promise.resolve()
export const validate: Validate<FormValues> = ({ products }) => {
  if (products.length > 0) return undefined
  return [
    {
      message: 'mustProvideProducts',
      path: 'products',
    },
  ]
}

export const productArbitrary = fc.record(
  {
    name: fc.string(),
    price: fc.float(),
    createdAt: fc.date(),
    forSale: fc.boolean(),
  },
  { noNullPrototype: true },
)

export const formValuesArbitrary = fc.record(
  {
    products: fc.array(productArbitrary, { maxLength: 10 }),
  },
  { noNullPrototype: true },
)
