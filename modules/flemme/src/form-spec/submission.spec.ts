/* eslint-disable security/detect-object-injection,@typescript-eslint/no-unused-vars */
import { it } from '@fast-check/vitest'
import { describe, expect, vi } from 'vitest'
import { FormMaker, formValuesArbitrary, make, Product, submit, validate } from './utils'

describe.each<FormMaker>(['recommended', 'lodash'])('form reset (%s)', (maker) => {
  const makeForm = make[maker]
  it('throws when submitting invalid values', async () => {
    const form = makeForm({ initial: { products: [] }, submit, validate })
    await expect(form.submit).rejects.toThrow(Error)
  })

  it('throws when resetting while submitting', async () => {
    let resolve = () => {}
    const form = makeForm({
      initial: { products: [] as Product[] },
      submit: () => {
        return new Promise<void>((r) => {
          resolve = r
        })
      },
    })
    const promise = form.submit()
    expect(form.reset).toThrow(Error)
    resolve()
    await promise
  })

  it.prop([formValuesArbitrary])('submits and resets form', async (values) => {
    const form = makeForm({ initial: { products: [] as Product[] }, submit })
    const resetListener = vi.fn()
    form.on('reset', resetListener)
    form.set(values)
    await form.submit()
    expect(form.values).toEqual(values)
    expect(form.initialValues).toEqual(values)
    expect(resetListener).toHaveBeenCalledOnce()
    expect(form.isDirty).toBe(false)
    expect(form.isValid).toBe(true)
    expect(form.errors).toBe(undefined)
  })

  it('emits submit events (successful submit)', async () => {
    let resolve = () => {}
    const form = makeForm({
      initial: { products: [] as Product[] },
      submit: () => {
        return new Promise<void>((r) => {
          resolve = r
        })
      },
    })
    const submitListener = vi.fn()
    const submittedListener = vi.fn()
    form.on('submit', submitListener)
    form.on('submitted', submittedListener)
    const product = { name: 'toto', createdAt: new Date(), forSale: true, price: 42 }
    const values = { products: [product] }
    form.set(values)
    const promise = form.submit()
    form.set({ products: [] })
    expect(submitListener).toHaveBeenNthCalledWith(1, { values })
    expect(submittedListener).not.toHaveBeenCalled()
    resolve()
    await promise
    expect(submittedListener).toHaveBeenNthCalledWith(1, { values })
  })

  it('emits submit events (failing submit)', async () => {
    let reject = (reason?: unknown) => {}
    const form = makeForm({
      initial: { products: [] as Product[] },
      submit: () => {
        return new Promise<void>((_, r) => {
          reject = r
        })
      },
    })
    const submitListener = vi.fn()
    const submittedListener = vi.fn()
    form.on('submit', submitListener)
    form.on('submitted', submittedListener)
    const product = { name: 'toto', createdAt: new Date(), forSale: true, price: 42 }
    const values = { products: [product] }
    form.set(values)
    const promise = form.submit()
    form.set({ products: [] })
    expect(submitListener).toHaveBeenNthCalledWith(1, { values })
    expect(submittedListener).not.toHaveBeenCalled()
    const error = new Error('something went wrong')
    reject(error)
    await promise
    expect(submittedListener).toHaveBeenNthCalledWith(1, { values, error })
  })

  it('accepts field changes during submission', () => {
    let resolve = () => {}
    const form = makeForm({
      initial: { products: [] as Product[] },
      submit: () =>
        new Promise<void>((r) => {
          resolve = r
        }),
    })
    void form.submit()
    form.focus('products')
    form.set('products', [{ name: 'toto', createdAt: new Date(), forSale: true, price: 42 }])
    resolve()
    expect(form.isVisited()).toBe(true)
    expect(form.isDirty).toBe(true)
  })

  it.prop([formValuesArbitrary.filter((v) => v.products.length > 0)])(
    'accepts form changes during submission',
    (values) => {
      let resolve = () => {}
      const form = makeForm({
        initial: { products: [] as Product[] },
        submit: () =>
          new Promise<void>((r) => {
            resolve = r
          }),
      })
      void form.submit()
      form.set(values)
      resolve()
      expect(form.isVisited()).toBe(false)
      expect(form.isDirty).toBe(true)
      expect(form.values.products).toEqual(values.products)
    },
  )
})
