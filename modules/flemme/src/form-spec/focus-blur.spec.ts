/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { createForm } from '../form'
import { formValuesArbitrary, submit } from './utils'

describe('form focus/blur', () => {
  const makeForm = createForm

  it.prop([formValuesArbitrary.filter(({ products }) => products.length > 0)])(
    'focuses first product name',
    (values) => {
      const form = makeForm({ initial: { ...values, name: 'toto' }, submit })
      const formListener = vi.fn()
      const pathListener = vi.fn()
      form.on('focus', formListener)
      form.on('focus', 'products', pathListener)
      expect(formListener).not.toHaveBeenCalled()
      expect(pathListener).not.toHaveBeenCalled()

      form.focus('products.0.name')
      expect(form.isVisited()).toBe(true)
      expect(form.isVisited('products.0')).toBe(true)
      expect(form.isVisited('products.0.name')).toBe(true)
      expect(form.isVisited('name')).toBe(false)
      expect(formListener).toHaveBeenNthCalledWith(1, { path: 'products.0.name' })
      expect(pathListener).toHaveBeenNthCalledWith(1, { path: 'products.0.name' })
    },
  )

  it.prop([formValuesArbitrary.filter(({ products }) => products.length > 0)])('blurs first product name', (values) => {
    const form = makeForm({ initial: values, submit })
    const formListener = vi.fn()
    const pathListener = vi.fn()
    form.on('blur', formListener)
    form.on('blur', 'products', pathListener)
    expect(formListener).not.toHaveBeenCalled()
    expect(pathListener).not.toHaveBeenCalled()

    form.focus('products.0.name')
    form.blur('products.0.name')
    expect(form.isVisited()).toBe(true)
    expect(formListener).toHaveBeenNthCalledWith(1, { path: 'products.0.name' })
    expect(pathListener).toHaveBeenNthCalledWith(1, { path: 'products.0.name' })
  })

  // these are backed by real-life scenarios.
  // it('triggers "focus" event once when same item is focused twice', () => {
  //   const form = makeForm({ initial: { name: 'toto' }, submit: async () => {} })
  //   const listener = vi.fn()
  //   form.on('name', 'focus', listener)
  //   form.focus('name')
  //   form.focus('name')
  //   expect(listener).toHaveBeenCalledOnce()
  // })

  // it('triggers "blur" event when another item is focused', () => {
  //   const form = makeForm({ initial: { a: 'toto', b: 'tata' }, submit: async () => {} })
  //   const listener = vi.fn()
  //   form.on('a', 'blur', listener)
  //   form.focus('a')
  //   form.focus('b')
  //   expect(listener).toHaveBeenCalledOnce()
  // })
})
