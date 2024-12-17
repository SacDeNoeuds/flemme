import { fc } from '@fast-check/vitest'
export type FormMaker = keyof typeof make
export type Product = {
  name: string
  price: number
  createdAt: Date
  forSale: boolean
}
export type FormValues = {
  products: Product[]
}
export declare const submit: (values: FormValues) => Promise<void>
export declare const validate: ({ products }: FormValues) => 'mustProvideProducts' | undefined
export declare const productArbitrary: fc.Arbitrary<{
  name: string
  price: number
  createdAt: Date
  forSale: boolean
}>
export declare const formValuesArbitrary: fc.Arbitrary<{
  products: {
    name: string
    price: number
    createdAt: Date
    forSale: boolean
  }[]
}>
export declare const make: {
  recommended: import('../make-form').MakeForm
  lodash: import('../make-form').MakeForm
}
