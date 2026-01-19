/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect } from 'vitest'
import { createForm } from '../form'
import { formValuesArbitrary, submit } from './utils'

describe('form reset', () => {
  const makeForm = createForm

  it.prop([formValuesArbitrary])('initializes', (values) => {
    const form = makeForm({ initial: values, submit })
    expect(form.initialValues).toEqual(values)
    expect(form.values).toEqual(values)
    expect(form.get('products.0.name')).toEqual(values.products[0]?.name)
    expect(form.isValid).toBe(true)
    expect(form.errors).toBe(undefined)
    expect(form.isDirty).toBe(false)
  })
})
