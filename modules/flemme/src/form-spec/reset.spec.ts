/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { createProductForm, formValuesArbitrary } from './utils'

describe('form reset', () => {
  it.prop([formValuesArbitrary])('resets form', (values) => {
    const form = createProductForm({ initialValues: values })
    const resetListener = vi.fn()
    const validatedListener = vi.fn()
    form.on('reset', resetListener)
    form.on('validated', validatedListener)
    expect(resetListener).not.toHaveBeenCalled()
    expect(validatedListener).not.toHaveBeenCalled()

    form.set('products', [])
    form.reset()
    expect(form.values).toEqual(values)
    expect(form.initialValues).toEqual(values)
    expect(resetListener).toHaveBeenNthCalledWith(1, {
      path: '',
      previous: form.initialValues,
      next: form.initialValues,
    })
    expect(validatedListener).toHaveBeenCalledOnce()
    expect(form.isDirty).toBe(false)
    expect(form.isValid).toBe(true)
    expect(form.errors).toEqual([])
  })

  it.prop([formValuesArbitrary.filter((v) => v.products.length > 0)])('resets products only', (values) => {
    const form = createProductForm({ initialValues: { ...values, name: 'toto' } })
    const nameResetListener = vi.fn()
    const productResetListener = vi.fn()
    const validatedListener = vi.fn()
    form.on('reset', 'products', productResetListener)
    form.on('reset', 'name', nameResetListener)
    form.on('validated', validatedListener)
    expect(productResetListener).not.toHaveBeenCalled()
    expect(nameResetListener).not.toHaveBeenCalled()
    expect(validatedListener).not.toHaveBeenCalled()

    form.set('name', 'jack')
    form.set('products', [])
    form.resetAt('products')
    expect(form.get('products')).toEqual(values.products)
    expect(form.initialValues.products).toEqual(values.products)
    expect(form.initialValues.name).toEqual('toto')
    expect(form.values.name).toEqual('jack')
    expect(form.isDirty).toBe(true)
    expect(form.isValid).toBe(true)
    expect(nameResetListener).not.toHaveBeenCalled()
    expect(productResetListener).toHaveBeenNthCalledWith(1, {
      path: 'products',
      previous: form.initialValues.products,
      next: form.initialValues.products,
    })
    expect(validatedListener).toHaveBeenCalledOnce()
  })

  it.prop([formValuesArbitrary.filter((v) => v.products.length > 0)])('resets products with value', (values) => {
    const form = createProductForm({ initialValues: { products: [], name: 'toto' } })
    const nameResetListener = vi.fn()
    const productResetListener = vi.fn()
    form.on('reset', 'products', productResetListener)
    form.on('reset', 'name', nameResetListener)
    expect(productResetListener).not.toHaveBeenCalled()
    expect(nameResetListener).not.toHaveBeenCalled()

    form.set('name', 'jack')
    form.resetAt('products', values.products)
    expect(form.values.products).toEqual(values.products)
    expect(form.initialValues.products).toEqual(values.products)
    expect(form.initialValues.name).toEqual('toto')
    expect(form.values.name).toEqual('jack')
    expect(form.isDirty).toBe(true)
    expect(form.isValid).toBe(true)
    expect(nameResetListener).not.toHaveBeenCalled()
    expect(productResetListener).toHaveBeenNthCalledWith(1, {
      path: 'products',
      previous: [],
      next: values.products,
    })
  })
})
