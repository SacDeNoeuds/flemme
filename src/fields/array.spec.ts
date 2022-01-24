/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validate } from '../lib/validation'
import { array } from './array'
import { InferField, InjectedData } from './common'
import { primitive } from './primitive'
import { mustNotContain } from './spec-helpers'

describe('array field', () => {
  const injected: InjectedData = { validateOn: ['blur'], path: ['cities'] }
  const forbidTokyoStub = jest.fn(() => [])
  const forbidTokyo = [mustNotContain('Tokyo'), forbidTokyoStub]
  const forbidParis = mustNotContain('Paris')
  const cityFieldFactory = primitive(...forbidTokyo)
  const forbidInnerParis: Validate<string[]> = (cities) => cities?.flatMap(forbidParis) ?? []
  const forbidInnerParisStub = jest.fn(() => [])
  const onInit = jest.fn()
  const makeField = (init: string[]) => array(cityFieldFactory, { validators: [forbidInnerParisStub, forbidInnerParis], onInit }).create(init, injected)

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should have a valid initial state', () => {
    const initial = ['Antananarivo']
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
    // prettier-ignore
    [{ initial: ['Paris'], errors: [{ type: mustNotContain.type, forbidden: 'Paris', value: 'Paris' }] }],
    [{ initial: ['Tokyo'], errors: [] }],
  ])('validation', ({ initial, errors }) => {
    it('should start with a valid state', () => {
      const field = makeField(initial)
      expect(forbidInnerParisStub).not.toHaveBeenCalled()
      expect(field).toMatchObject({
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

    it('should have an invalid initial state', () => {
      const field = makeField(initial)
      field.validate()
      expect(forbidInnerParisStub).toHaveBeenCalled()
      expect(field).toMatchObject({
        initial,
        value: initial,
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
    makeField(['Singapour']).validate()
    expect(forbidInnerParisStub).toHaveBeenCalledWith(['Singapour'])
  })

  it('should run nested validate function', () => {
    makeField(['Singapour']).validate()
    expect(forbidTokyoStub).toHaveBeenCalledWith('Singapour')
  })

  it('should trigger onInit', () => {
    const field = makeField(['Singapour'])
    expect(onInit).toHaveBeenCalledWith(field)
  })

  describe('interactions', () => {
    const initial = ['Paris']
    const changeListener = jest.fn()
    const focusListener = jest.fn()
    const blurListener = jest.fn()
    const resetListener = jest.fn()
    let field!: InferField<string[]>
    let cityField!: InferField<string>
    beforeEach(() => {
      field = makeField(initial)
      cityField = field.fields[0]
      field.on('change', changeListener)
      field.on('focus', focusListener)
      field.on('blur', blurListener)
      field.on('reset', resetListener)
    })
    describe('inner field focus', () => {
      beforeEach(() => cityField.focus())
      it('should reflect visited value', () => expect(field.visited).toBe(true))
      it('should reflect active value', () => expect(field.active).toBe(true))
      it('should reflect "focus" listener', () => expect(focusListener).toHaveBeenCalledWith(field))

      describe('inner field blur', () => {
        beforeEach(() => {
          jest.resetAllMocks()
          cityField.blur()
        })
        it('should reflect visited value', () => expect(field.visited).toBe(true))
        it('should reflect active value', () => expect(field.active).toBe(false))
        it('should reflect "blur" listener', () => expect(blurListener).toHaveBeenCalledWith(field))
        it('should have validated inner field', () => expect(forbidTokyoStub).toHaveBeenCalledTimes(1))
        it('should have validated array field', () => expect(forbidInnerParisStub).toHaveBeenCalledTimes(1))
      })
    })

    describe('field-level change to same value', () => {
      beforeEach(() => field.change(initial))
      it('should remain pristine', () => expect(field.pristine).toBe(true))
      it('should not be dirty', () => expect(field.dirty).toBe(false))
      it('should be touched value', () => expect(field.touched).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
    })

    describe('field-level change to different value', () => {
      describe('of same size', () => {
        beforeEach(() => field.change(['New York']))
        it('should not be pristine', () => expect(field.pristine).toBe(false))
        it('should be dirty', () => expect(field.dirty).toBe(true))
        it('should reflect touched value', () => expect(field.touched).toBe(true))
        it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
        it('should update existing field', () =>
          expect(field.fields[0]).toMatchObject({
            initial: initial[0],
            value: 'New York',
            touched: true,
            dirty: true,
          }))

        describe.each([undefined, null])('%s', (emptyValue) => {
          beforeEach(() => field.change(emptyValue as any))
          it.each([emptyValue])('should have %s fields', () => expect(field.fields).toBe(emptyValue))
          it.each([emptyValue])('should have %s value', () => expect(field.value).toBe(emptyValue))
          it('should be touched', () => expect(field.touched).toBe(true))
        })
      })

      describe('of lower size', () => {
        beforeEach(() => {
          field.reset(['New York', 'Berne'])
          field.change(['Istanbul'])
        })
        it('should not be pristine', () => expect(field.pristine).toBe(false))
        it('should be dirty', () => expect(field.dirty).toBe(true))
        it('should be touched', () => expect(field.touched).toBe(true))
        it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
        it('should not have a second field', () => expect(field.fields[1]).toBe(undefined))
      })

      describe('of greater size', () => {
        beforeEach(() => field.change([initial[0], 'Istanbul']))
        it('should not be pristine', () => expect(field.pristine).toBe(false))
        it('should be dirty', () => expect(field.dirty).toBe(true))
        it('should be touched', () => expect(field.touched).toBe(true))
        it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
        it('should have a second field', () => {
          expect(field.fields[1]).toMatchObject({
            initial: undefined,
            value: 'Istanbul',
            touched: true,
            dirty: true,
          })
        })
      })
    })

    describe('inner-field change to same value', () => {
      beforeEach(() => cityField.change(initial[0]))
      it('should remain pristine', () => expect(field.pristine).toBe(true))
      it('should not be dirty', () => expect(field.dirty).toBe(false))
      it('should reflect touched', () => expect(field.touched).toBe(true))
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
      beforeEach(() => field.change(['Tbilissi']))

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
        field.reset(['Luanda'])
        expect(field).toMatchObject({
          initial: ['Luanda'],
          value: ['Luanda'],
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

    describe('add', () => {
      beforeEach(() => field.add('Rabat'))
      it('should be touched', () => expect(field.touched).toBe(true))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
      it('should have a second field', () =>
        expect(field.fields[1]).toMatchObject({
          initial: undefined,
          value: 'Rabat',
          touched: true,
          dirty: true,
        }))
    })
    describe('remove', () => {
      beforeEach(() => {
        field.reset(['Luanda', 'Rabat'])
        field.remove(1)
      })
      it('should be touched', () => expect(field.touched).toBe(true))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
      it('should not have a second field', () => expect(field.fields[1]).toBe(undefined))
      it('should update the value', () => expect(field.value).toEqual(['Luanda']))
      it('should not fail when removing out-of-bound index', () =>
        expect(() => {
          field.remove(-1)
          field.remove(130)
        }).not.toThrow())
    })

    describe('move', () => {
      const initial = ['Luanda', 'Rabat']
      beforeEach(() => {
        field.reset(initial)
        field.move(0, 1)
      })
      it('should be touched', () => expect(field.touched).toBe(true))
      it('should be dirty', () => expect(field.dirty).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(field))
      it('should swap the values', () => expect(field.value).toEqual([...initial].reverse()))
      it('should fail when removing out-of-bound index', () => {
        expect(() => field.move(-1, 0)).toThrow()
        expect(() => field.move(0, -1)).toThrow()
        expect(() => field.move(0, 130)).toThrow()
        expect(() => field.move(130, 0)).toThrow()
      })
    })
  })

  describe('async validation', () => {
    const injected: InjectedData = { path: [], validateOn: ['blur'] }
    type Arr = string[]
    const forbidTokyo: Validate<Arr> = (obj) => mustNotContain('Tokyo')(obj?.[0])
    const forbidParisStub = jest.fn()
    const forbidParis = mustNotContain('Paris')
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const validateCity = async ([city]: Arr) => {
      await sleep(50)
      forbidParisStub()
      return forbidParis(city)
    }
    const makeField = (init: Arr) => array(primitive<string>(), { validators: [forbidTokyo], validateAsync: validateCity }).create(init, injected)
    // let field!: ObjectField<Obj>

    it('should be not trigger async validation when sync already fails', async () => {
      const field = makeField(['Tokyo'])
      field.validate()
      await expect(field.validated).resolves.toBe(undefined)
      expect(forbidParisStub).not.toHaveBeenCalled()
    })

    it('should validate asynchronously valid value', async () => {
      const field = makeField(['Luanda'])
      field.validate()
      await expect(field.validated).resolves.toBe(undefined)
      expect(forbidParisStub).toHaveBeenCalled()
      expect(field.valid).toBe(true)
    })

    it('should invalidate asynchronously invalid value', async () => {
      const field = makeField(['Paris'])
      field.validate()
      await expect(field.validated).resolves.toBe(undefined)
      expect(forbidParisStub).toHaveBeenCalled()
      expect(field.valid).toBe(false)
      expect(field.errors).toEqual([{ type: mustNotContain.type, forbidden: 'Paris', value: 'Paris' }])
    })
  })
})
