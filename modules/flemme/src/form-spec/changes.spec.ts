/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { createForm } from '../form'
import { formValuesArbitrary, Product, productArbitrary, submit } from './utils'

describe('form changes', () => {
  const makeForm = createForm

  it.prop([formValuesArbitrary, productArbitrary])('a whole array value', (values, product) => {
    const form = makeForm({ initial: values, submit })
    const listener = vi.fn()
    form.on('change', listener)
    expect(listener).not.toHaveBeenCalled()
    form.set('products', [product])
    expect(form.values).toEqual({ products: [product] })
    expect(listener).toHaveBeenCalledOnce()
    expect(form.isDirty).toBe(true)
  })

  it.prop([formValuesArbitrary, productArbitrary])('an array’s first value', (values, product) => {
    const form = makeForm({ initial: { ...values, name: 'toto' }, submit })
    const listener = vi.fn()
    form.on('change', listener)
    expect(listener).not.toHaveBeenCalled()
    form.set('products.0', product)
    expect(form.values).toEqual({ name: 'toto', products: [product, ...values.products.slice(1)] })
    expect(listener).toHaveBeenNthCalledWith(1, { path: 'products.0', previous: values.products[0], next: product })
    expect(form.isDirty).toBe(true)
    expect(form.isDirtyAt('products.0')).toBe(true)
    expect(form.isDirtyAt('name')).toBe(false)
  })

  it.prop([formValuesArbitrary.filter(({ products }) => products.length > 0)])('a value with same value', (values) => {
    const form = makeForm({ initial: values, submit })
    const listener = vi.fn()
    form.on('change', listener)
    expect(listener).not.toHaveBeenCalled()
    const product = values.products[0]
    form.set('products.0', product)
    expect(form.values).toEqual({ products: [product, ...values.products.slice(1)] })
    expect(listener).toHaveBeenCalledOnce()
    expect(form.isDirty).toBe(false)
  })

  it.prop([formValuesArbitrary.filter((v) => v.products.length > 0)])('changes the whole form value', (values) => {
    const form = makeForm({
      initial: { products: [] as Product[] },
      submit,
    })
    const listener = vi.fn()
    form.on('change', listener)
    expect(listener).not.toHaveBeenCalled()
    form.set(values)
    expect(form.values).toEqual(values)
    expect(listener).toHaveBeenNthCalledWith(1, { path: '', previous: form.initialValues, next: values })
    expect(form.isDirty).toBe(true)
  })
})
