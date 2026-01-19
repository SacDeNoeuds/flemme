import { fc } from '@fast-check/vitest'
import fastDeepEqual from 'fast-deep-equal'
import get from 'just-safe-get'
import set from 'just-safe-set'
import _ from 'lodash'
import { Flemme, Validate } from '../make-form'

export type FormMaker = keyof typeof make

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

export const productArbitrary = fc.record({
  name: fc.string(),
  price: fc.float(),
  createdAt: fc.date(),
  forSale: fc.boolean(),
})
export const formValuesArbitrary = fc.record({
  products: fc.array(productArbitrary, { maxLength: 10 }),
})

export const make = {
  recommended: Flemme({
    cloneDeep: _.clone,
    get,
    isEqual: fastDeepEqual,
    set,
  }),
  lodash: Flemme(_),
}
