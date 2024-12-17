/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { FormMaker, formValuesArbitrary, make, Product, submit, validate } from './utils'

describe.each<FormMaker>(['recommended', 'lodash'])('form reset (%s)', (maker) => {
  const makeForm = make[maker]

  it.prop([formValuesArbitrary])('resets form', (values) => {
    const form = makeForm({ initial: values, submit, validate })
    const listener = vi.fn()
    form.on('reset', listener)
    expect(listener).not.toHaveBeenCalled()

    form.set('products', [])
    form.reset()
    expect(form.values).toEqual(values)
    expect(form.initialValues).toEqual(values)
    expect(listener).toHaveBeenNthCalledWith(1, { path: '', previous: form.initialValues, next: form.initialValues })
    expect(form.isDirty).toBe(false)
    expect(form.isValid).toBe(true)
    expect(form.errors).toBe(undefined)
  })

  it.prop([formValuesArbitrary.filter((v) => v.products.length > 0)])('resets products only', (values) => {
    const form = makeForm({ submit, initial: { ...values, name: 'toto' }, validate })
    const nameResetListener = vi.fn()
    const productResetListener = vi.fn()
    form.on('reset', 'products', productResetListener)
    form.on('reset', 'name', nameResetListener)
    expect(productResetListener).not.toHaveBeenCalled()
    expect(nameResetListener).not.toHaveBeenCalled()

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
  })

  it.prop([formValuesArbitrary.filter((v) => v.products.length > 0)])('resets products with value', (values) => {
    const form = makeForm({ submit, initial: { products: [] as Product[], name: 'toto' } })
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
