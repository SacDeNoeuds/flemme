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
})
