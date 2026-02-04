/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { createProductForm } from './utils'

describe('product form', () => {
  it('validates the form', () => {
    const form = createProductForm({ initialValues: { products: [] } })
    const listener = vi.fn()
    form.on('validated', listener)
    form.validate()
    expect(form.isValid).toBe(false)
    expect(form.errors).toHaveLength(1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('auto-validates form upon trigger', () => {
    const form = createProductForm({
      initialValues: { products: [] },
      validationTriggers: ['blur'],
    })
    form.blur('products')
    expect(form.isValid).toBe(false)
  })

  it('validates only a primitive field', () => {
    const form = createProductForm({
      validationTriggers: ['blur'],
    })
    form.set('products.0.createdAt', new Date(NaN))
    form.validateAt('products.0.name')
    expect(form.isValidAt('products.0.createdAt')).toBe(true)
    form.validateAt('products.0.createdAt')
    expect(form.isValidAt('products.0.createdAt')).toBe(false)
  })

  it('validates all nested fields at path', () => {
    const form = createProductForm({
      validationTriggers: ['blur'],
    })
    const firstProductListener = vi.fn()
    const secondProductListener = vi.fn()
    const productsListener = vi.fn()
    form.on('validated', 'products.0', firstProductListener)
    form.on('validated', 'products.1', secondProductListener)
    form.on('validated', 'products', productsListener)

    const firstProduct = form.values.products[0]!
    const invalidProduct = { ...firstProduct, name: '', createdAt: new Date(NaN) }
    form.set('products.0', { ...invalidProduct })
    form.set('products.1', { ...invalidProduct })
    form.validateAt('products.1')
    // it does not validate sibling field
    expect(form.isValidAt('products.0.createdAt')).toBe(true)
    expect(form.isValidAt('products.0.name')).toBe(true)
    expect(form.isValidAt('products.0')).toBe(true)
    expect(firstProductListener).not.toHaveBeenCalled()

    // it validates only field at index 1
    expect(form.isValidAt('products.1.createdAt')).toBe(false)
    expect(form.isValidAt('products.1.name')).toBe(false)
    expect(form.isValidAt('products.1')).toBe(false)
    expect(form.isValidAt('products')).toBe(false)
    expect(secondProductListener).toHaveBeenCalledOnce()
    expect(productsListener).toHaveBeenCalledOnce()
  })

  it('considers a field as invalid when its value is invalid', () => {
    const form = createProductForm({
      initialValues: { products: [] },
      validationTriggers: ['blur'],
    })
    expect(form.isValidAt('products')).toBe(false)
  })

  it('considers a field as invalid when a nested value is invalid', () => {
    const form = createProductForm({
      initialValues: {
        products: [
          {
            name: '1',
            createdAt: new Date(NaN),
            forSale: true,
            price: 12,
          },
        ],
      },
      validationTriggers: ['blur'],
    })
    expect(form.isValidAt('products.0.name')).toBe(true)
    expect(form.isValidAt('products.0.createdAt')).toBe(false)
    expect(form.isValidAt('products')).toBe(false)
  })
})
