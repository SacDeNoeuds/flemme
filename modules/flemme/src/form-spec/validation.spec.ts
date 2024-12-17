/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { FormMaker, make, submit, validate } from './utils'

describe.each<FormMaker>(['recommended', 'lodash'])('product form (%s)', (maker) => {
  const makeForm = make[maker]

  it('validates the form', () => {
    const form = makeForm({ initial: { products: [] }, submit, validate })
    const listener = vi.fn()
    form.on('validated', listener)
    form.validate()
    expect(form.isValid).toBe(false)
    expect(form.errors).toBe('mustProvideProducts')
    expect(listener).toHaveBeenNthCalledWith(1, { errors: 'mustProvideProducts' })
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
