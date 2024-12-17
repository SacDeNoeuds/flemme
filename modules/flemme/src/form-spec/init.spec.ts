/* eslint-disable security/detect-object-injection */
import { it } from '@fast-check/vitest'
import { describe, expect } from 'vitest'
import { FormMaker, formValuesArbitrary, make, submit } from './utils'

describe.each<FormMaker>(['recommended', 'lodash'])('form reset (%s)', (maker) => {
  const makeForm = make[maker]

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
