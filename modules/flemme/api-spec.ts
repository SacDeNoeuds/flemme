import _ from 'lodash'
import { Flemme, FormError, FormErrors } from './src/make-form'

// DOMAIN
type Product = {
  id: number
  name: string
  prices: Record<'EUR' | 'USD', number>
  forSale: boolean
  variants: string[]
}
type ProductPayload = Omit<Product, 'id'>
function EmptyProductFormValues(): ProductPayload {
  return {
    name: '',
    prices: { EUR: 0, USD: 0 },
    forSale: false,
    variants: [],
  }
}
function validateProductPayload(product: ProductPayload): FormErrors<ProductPayload> {
  const errors: FormError<ProductPayload>[] = []
  if (product.variants.length === 0) errors.push({ message: 'variants_required', path: 'variants' })
  return errors.length ? errors : undefined
}
// END DOMAIN
declare const product: Product
declare const api: {
  createProduct: (product: ProductPayload) => Promise<void>
  updateProduct: (id: number, product: ProductPayload) => Promise<void>
}
const makeForm = Flemme(_)

function makeProductForm(options: {
  initialValues?: ProductPayload
  save: (product: ProductPayload) => Promise<void>
}) {
  return makeForm({
    initial: options.initialValues ?? EmptyProductFormValues(),
    validationTriggers: ['blur'],
    validate: validateProductPayload,
    submit: options.save,
  })
}

const productForm1 = makeProductForm({
  save: api.createProduct,
})
const productForm2 = makeProductForm({
  initialValues: product,
  save: (values) => api.updateProduct(product.id, values),
})
