/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { createForm } from '../form'
import { submit, validate } from './utils'

describe('product form', () => {
  const makeForm = createForm

  it('validates the form', () => {
    const form = makeForm({ initial: { products: [] }, submit, validate })
    const listener = vi.fn()
    form.on('validated', listener)
    form.validate()
    expect(form.isValid).toBe(false)
    const errors = [{ message: 'mustProvideProducts', path: 'products' }]
    expect(form.errors).toEqual(errors)
    expect(listener).toHaveBeenNthCalledWith(1, { errors })
  })

  it('auto-validates form upon trigger', () => {
    const form = makeForm({
      initial: { products: [] },
      submit,
      validate,
      validationTriggers: ['blur'],
    })
    form.blur('products')
    expect(form.isValid).toBe(false)
  })
})
