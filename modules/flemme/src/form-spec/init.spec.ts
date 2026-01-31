/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect } from 'vitest'
import { createProductForm, formValuesArbitrary } from './utils'

describe('form reset', () => {
  it.prop([formValuesArbitrary])('initializes', (values) => {
    const form = createProductForm({ initialValues: values })
    expect(form.initialValues).toEqual(values)
    expect(form.values).toEqual(values)
    expect(form.get('products.0.name')).toEqual(values.products[0]?.name)
    expect(form.isValid).toBe(true)
    expect(form.errors).toEqual([])
    expect(form.isDirty).toBe(false)
  })
})
