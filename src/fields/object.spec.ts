/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validator } from '../main'
import { InferField, InferValue, InjectedData } from './common'
import { merge, object } from './object'
import { primitive } from './primitive'
import { mustNotContain } from './spec-helpers'

describe('object field', () => {
  const injected: InjectedData = { validateOn: ['blur'], path: ['form'] }
  const forbidTokyoStub = jest.fn(() => [])
  const forbidTokyo = [forbidTokyoStub, mustNotContain('Tokyo')]
  const forbidParis = mustNotContain('Paris')
  const cityFieldFactory = primitive(...forbidTokyo)

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  const forbidInnerParisStub = jest.fn(() => [])
  type CityObj = { city: string }
  const forbidInnerParis: Validator<CityObj>[] = [forbidInnerParisStub, (obj) => forbidParis(obj?.city)]
  const onInit = jest.fn()
  const makeField = (init: CityObj) => object({ city: cityFieldFactory }, { validators: forbidInnerParis, onInit }).create(init, injected)

  it('should have a valid initial state', () => {
    const initial = { city: 'Antananarivo' }
    expect(makeField(initial)).toMatchObject({
      name: injected.path.join('.'),
      initial,
      value: initial,
      errors: [],
      valid: true,
      dirty: false,
      pristine: true,
      touched: false,
      visited: false,
      active: false,
    })
  })

  describe.each([
    ['Tokyo', []],
    ['Paris', [{ type: mustNotContain.type, forbidden: 'Paris', value: 'Paris' }]],
  ])('with an invalid initial value', (initial, errors) => {
    it('should have a valid initial state', () => {
      expect(makeField({ city: initial })).toMatchObject({
        initial: { city: initial },
        value: { city: initial },
        errors: [],
        valid: true,
        dirty: false,
        pristine: true,
        touched: false,
        visited: false,
        active: false,
      })
    })

    it('should have an invalid state after validation', () => {
      const field = makeField({ city: initial })
      field.validate()
      expect(field).toMatchObject({
        initial: { city: initial },
        value: { city: initial },
        errors,
        valid: false,
        dirty: false,
        pristine: true,
        touched: false,
        visited: false,
        active: false,
      })
    })
  })

  it('should run validate function', () => {
    makeField({ city: 'Singapour' }).validate()
    expect(forbidInnerParisStub).toHaveBeenCalledWith({ city: 'Singapour' })
  })

  it('should run nested validate function', () => {
    makeField({ city: 'Singapour' }).validate()
    expect(forbidTokyoStub).toHaveBeenCalledWith('Singapour')
  })

  it('should trigger onInit', () => {
    const field = makeField({ city: 'Singapour' })
    expect(onInit).toHaveBeenCalledWith(field)
  })

  describe('interactions', () => {
    const initial = { city: 'Paris' }
    const changeListener = jest.fn()
    const focusListener = jest.fn()
    const blurListener = jest.fn()
    const resetListener = jest.fn()
    let field!: InferField<{ city: string }>
    let cityField!: InferField<string>
    beforeEach(() => {
      field = makeField(initial)
      cityField = field.fields.city
      field.on('change', changeListener)
      field.on('focus', focusListener)
      field.on('blur', blurListener)
      field.on('reset', resetListener)
    })
    describe('focus', () => {
      beforeEach(() => cityField.focus())
      it('should reflect visited value', () => expect(field.visited).toBe(true))
      it('should reflect active value', () => expect(field.active).toBe(true))
      it('should reflect "focus" listener', () => expect(focusListener).toHaveBeenCalledWith(field))

      describe('blur', () => {
        beforeEach(() => {
          jest.resetAllMocks()
          cityField.blur()
        })
        it('should reflect visited value', () => expect(field.visited).toBe(true))
        it('should reflect "blur" listener', () => expect(blurListener).toHaveBeenCalledWith(field))
        it('should validate inner field', () => expect(forbidTokyoStub).toHaveBeenCalledTimes(1))
        it('should validate object field', () => expect(forbidInnerParisStub).toHaveBeenCalledTimes(1))
      })
    })

    describe('field-level change to same value', () => {
      beforeEach(() => field.change(initial))
      it('should remain pristine', () => expect(field.pristine).toBe(true))
      it('should not be dirty', () => expect(field.dirty).toBe(false))
      it('should be touched', () => expect(field.touched).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
    })

    describe('field-level change to different value', () => {
      beforeEach(() => field.change({ city: 'New York' }))
      it('should not be pristine', () => expect(field.pristine).toBe(false))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should be touched', () => expect(field.touched).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
    })

    describe.each([null, undefined])('field-level change to %s', (emptyValue) => {
      beforeEach(() => {
        onInit.mockClear()
        field.change(emptyValue as any)
      })
      it('should have empty value', () => expect(field.value).toBe(emptyValue))
      it('should not be pristine', () => expect(field.pristine).toBe(false))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should be touched', () => expect(field.touched).toBe(true))
      it('should have no fields', () => expect(field.fields).toBe(emptyValue))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
      it('should not call init', () => expect(onInit).not.toHaveBeenCalled())

      describe('field-level rechange to populated value', () => {
        beforeEach(() => field.change({ city: 'Djibouti' }))
        it('should not be pristine', () => expect(field.pristine).toBe(false))
        it('should be dirty', () => expect(field.dirty).toBe(true))
        it('should be touched', () => expect(field.touched).toBe(true))
        it('should have fields', () => expect(field.fields.city).toBeDefined())
        it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
        it('should call init again', () => expect(onInit).toHaveBeenCalledTimes(1))
      })
    })

    describe('inner-field change to same value', () => {
      beforeEach(() => cityField.change(initial.city))
      it('should remain pristine', () => expect(cityField.pristine).toBe(true))
      it('should not be dirty', () => expect(cityField.dirty).toBe(false))
      it('should reflect touched', () => expect(cityField.touched).toBe(true))
      it('should reflect "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
    })

    describe('inner-field change to different value', () => {
      beforeEach(() => cityField.change('New York'))
      it('should not be pristine', () => expect(field.pristine).toBe(false))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should reflect touched', () => expect(field.touched).toBe(true))
      it('should reflect "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
    })

    describe('reset', () => {
      beforeEach(() => field.change({ city: 'Tbilissi' }))

      it('should return to its initial state', () => {
        field.reset()
        expect(field).toMatchObject({
          initial,
          value: initial,
          errors: [],
          valid: true,
          dirty: false,
          pristine: true,
          touched: false,
          visited: false,
        })
        expect(resetListener).toHaveBeenCalled()
      })

      it('should reset with new initial value', () => {
        field.reset({ city: 'Luanda' })
        expect(field).toMatchObject({
          initial: { city: 'Luanda' },
          value: { city: 'Luanda' },
          errors: [],
          valid: true,
          dirty: false,
          pristine: true,
          touched: false,
          visited: false,
        })
        expect(resetListener).toHaveBeenCalled()
      })
    })
  })

  describe('async validation', () => {
    const injected: InjectedData = { path: [], validateOn: ['blur'] }
    type Obj = { city: string }
    const forbidTokyo: Validator<Obj> = (obj) => mustNotContain('Tokyo')(obj?.city)
    const forbidParisStub = jest.fn()
    const forbidParis = mustNotContain('Paris')
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const validateCity = async ({ city }: Obj) => {
      await sleep(50)
      forbidParisStub()
      return forbidParis(city)
    }
    const makeField = (init: Obj) => object({ city: primitive<string>() }, { validators: [forbidTokyo], validateAsync: validateCity }).create(init, injected)
    // let field!: ObjectField<Obj>

    it('should be not trigger async validation when sync already fails', async () => {
      const field = makeField({ city: 'Tokyo' })
      field.validate()
      await expect(field.validated).resolves.toBe(undefined)
      expect(forbidParisStub).not.toHaveBeenCalled()
    })

    it('should validate asynchronously valid value', async () => {
      const field = makeField({ city: 'Luanda' })
      field.validate()
      await expect(field.validated).resolves.toBe(undefined)
      expect(forbidParisStub).toHaveBeenCalled()
      expect(field.valid).toBe(true)
    })

    it('should invalidate asynchronously invalid value', async () => {
      const field = makeField({ city: 'Paris' })
      field.validate()
      await expect(field.validated).resolves.toBe(undefined)
      expect(forbidParisStub).toHaveBeenCalled()
      expect(field.valid).toBe(false)
      expect(field.errors).toEqual([{ type: mustNotContain.type, forbidden: 'Paris', value: 'Paris' }])
    })
  })
})

describe('merge', () => {
  const injected: InjectedData = { validateOn: [], path: ['form'] }
  const schema = () => merge(object({ city: primitive<string>() }), object({ country: primitive<string>() }))
  type Value = InferValue<ReturnType<typeof schema>>
  const initial: Value = { city: 'Tokyo', country: 'Japan' }
  const makeField = (value: Value) => schema().create(value, injected)
  let field: InferField<Value>
  const changeListener = jest.fn()
  let unlisten!: () => void
  beforeEach(() => {
    field = makeField(initial)
    unlisten = field.on('change', changeListener)
  })

  it('should init properly', () => {
    expect(field).toMatchObject({ initial, value: initial })
  })

  describe('change', () => {
    const next: Value = { city: 'Paris', country: 'France' }
    beforeEach(() => field.change(next))
    it('should change value', () => expect(field.value).toEqual(next))
    it('should have called change listener', () => expect(changeListener).toHaveBeenCalled())

    describe('unlisten', () => {
      beforeEach(() => {
        jest.resetAllMocks()
        unlisten()
        field.change({ city: 'Rome', country: 'Italy' })
      })
      it('should not have called listener', () => expect(changeListener).not.toHaveBeenCalled())
    })

    describe('reset', () => {
      beforeEach(() => field.reset())
      it('should reset the field', () => expect(field).toMatchObject({ initial, value: initial, pristine: true }))
    })
  })
})
