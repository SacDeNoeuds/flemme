import { array } from './array'
import { InferField } from './common'
import { form, Form } from './form'
import { object } from './object'
import { primitive } from './primitive'
import { forbidString } from './spec-helpers'

describe('form', () => {
  const forbidTokyoStub = jest.fn(() => [])
  const forbidTokyo = [forbidString('Tokyo'), forbidTokyoStub]
  const cityFieldFactory = primitive(...forbidTokyo)

  const onInit = jest.fn()
  type CityObj = { cities: string[] }
  let cityForm!: Form<CityObj>
  const makeCityForm = form<CityObj>({
    schema: object({ cities: array(cityFieldFactory) }),
    onInit,
  })
  beforeEach(() => (cityForm = makeCityForm({ cities: ['Amsterdam'] })))
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should initial submit state "NotAsked"', () => expect(cityForm.submitState).toBe('NotAsked'))
  it('should have called init hook', () => expect(onInit).toHaveBeenCalledWith(cityForm))

  it('should update submit state', () => {
    cityForm.setSubmitState('Pending')
    expect(cityForm.submitState).toBe('Pending')
  })
  it('should reset form with current form value when submit state is "Success"', () => {
    cityForm.change({ cities: ['Bruxelles'] })
    cityForm.setSubmitState('Success')
    expect(cityForm).toMatchObject({
      value: { cities: ['Bruxelles'] },
      initial: { cities: ['Bruxelles'] },
      submitState: 'Success',
      dirty: false,
      touched: false,
      visited: false,
      valid: true,
    })
  })

  describe('interactions', () => {
    const initial = { cities: ['Paris'] }
    const changeListener = jest.fn()
    const focusListener = jest.fn()
    const blurListener = jest.fn()
    let field!: Form<CityObj>
    let cityField!: InferField<string>
    beforeEach(() => {
      field = makeCityForm(initial)
      cityField = field.fields.cities.fields[0]
      field.on('change', changeListener)
      field.on('focus', focusListener)
      field.on('blur', blurListener)
    })
    describe('focus', () => {
      beforeEach(() => cityField.focus())
      it('should reflect visited value', () => expect(field.visited).toBe(true))
      it('should reflect "focus" listener', () => expect(focusListener).toHaveBeenCalled())

      describe('blur', () => {
        beforeEach(() => cityField.blur())
        it('should reflect visited value', () => expect(field.visited).toBe(true))
        it('should reflect "blur" listener', () => expect(blurListener).toHaveBeenCalled())
      })
    })

    describe('field-level change to same value', () => {
      beforeEach(() => field.change(initial))
      it('should remain pristine', () => expect(field.pristine).toBe(true))
      it('should not be dirty', () => expect(field.dirty).toBe(false))
      it('should be touched', () => expect(field.touched).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalled())
    })

    describe('field-level change to different value', () => {
      beforeEach(() => field.change({ cities: ['New York'] }))
      it('should not be pristine', () => expect(field.pristine).toBe(false))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should be touched value', () => expect(field.touched).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalled())
    })

    describe('inner-field change to same value', () => {
      beforeEach(() => cityField.change(initial.cities[0]))
      it('should remain pristine', () => expect(cityField.pristine).toBe(true))
      it('should not be dirty', () => expect(cityField.dirty).toBe(false))
      it('should reflect touched', () => expect(cityField.touched).toBe(true))
      it('should reflect "change" listener', () => expect(changeListener).toHaveBeenCalled())
    })

    describe('inner-field change to different value', () => {
      beforeEach(() => cityField.change('New York'))
      it('should not be pristine', () => expect(field.pristine).toBe(false))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should reflect touched', () => expect(field.touched).toBe(true))
      it('should reflect "change" listener', () => expect(changeListener).toHaveBeenCalled())
    })
  })

  describe('get errors', () => {
    type Value = { cities: Array<{ name: string }>; country: string }
    const makeForm = form({
      schema: object({
        cities: array(object({ name: primitive<string>(...forbidTokyo) })),
        country: primitive<string>(forbidString('Japan')),
      }),
    })
    let theForm: Form<Value>
    beforeEach(() => (theForm = makeForm({ cities: [{ name: 'Tokyo' }, { name: 'Tokyo' }], country: 'Japan' })))

    it('should have errors', () => {
      expect(theForm.errors).toEqual([
        expect.objectContaining({
          message: 'Cannot contain "Tokyo"',
          field: expect.objectContaining({ name: 'cities.0.name' }),
        }),
        expect.objectContaining({
          message: 'Cannot contain "Tokyo"',
          field: expect.objectContaining({ name: 'cities.1.name' }),
        }),
        expect.objectContaining({
          message: 'Cannot contain "Japan"',
          field: expect.objectContaining({ name: 'country' }),
        }),
      ])
    })
  })
})
