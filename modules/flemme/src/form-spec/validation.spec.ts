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
            name: '',
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
