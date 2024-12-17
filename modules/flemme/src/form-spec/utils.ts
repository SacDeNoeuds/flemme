import { fc } from '@fast-check/vitest'
import fastDeepEqual from 'fast-deep-equal'
import get from 'just-safe-get'
import set from 'just-safe-set'
import _ from 'lodash'
import objectDeepCopy from 'object-deep-copy'
import { Flemme } from '../make-form'

export type FormMaker = keyof typeof make

export type Product = {
  name: string
  price: number
  createdAt: Date
  forSale: boolean
}
export type FormValues = { products: Product[] }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const submit = (_values: FormValues): Promise<void> => Promise.resolve()
export const validate = ({ products }: FormValues) => (products.length === 0 ? 'mustProvideProducts' : undefined)

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
    cloneDeep: objectDeepCopy,
    get,
    isEqual: fastDeepEqual,
    set,
  }),
  lodash: Flemme(_),
}
