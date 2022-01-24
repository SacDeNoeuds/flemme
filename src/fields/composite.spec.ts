import { array, InferField, object, primitive, Validate } from '../main'
import { InjectedData } from './common'
import { forbidString } from './spec-helpers'

describe('composite fields', () => {
  const injected: InjectedData = { validateOn: [], path: ['form'] }
  const forbidTokyoStub = jest.fn(() => [])
  const forbidTokyo = [forbidString('Tokyo'), forbidTokyoStub]
  const forbidParis = forbidString('Paris')
  const cityFieldFactory = primitive(...forbidTokyo)

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe('object of array', () => {
    type Obj = { cities: string[] }
    const forbidInnerParis: Validate<Obj> = (data) => data?.cities.flatMap(forbidParis) ?? []
    const forbidInnerParisStub = jest.fn(() => [])
    const onInit = jest.fn()
    const resetListener = jest.fn()
    const makeField = (init: Obj) =>
      object(
        {
          cities: array(cityFieldFactory),
        },
        {
          validators: [forbidInnerParis, forbidInnerParisStub],
          onInit,
        },
      ).create(init, injected)

    describe('reset', () => {
      let field!: InferField<Obj>
      const initial = { cities: ['Paris', 'Luanda'] }
      const nextInitial = { cities: ['Athènes', 'Vilnius'] }
      beforeEach(() => {
        field = makeField(initial)
        field.on('reset', resetListener)
        field.change({ cities: ['Amsterdam'] })
      })

      it('should return to its initial state', () => {
        field.reset()
        field.validate()
        expect(field).toMatchObject({
          initial,
          value: initial,
          errors: [{ message: 'Cannot contain "Paris"' }],
          valid: false,
          dirty: false,
          pristine: true,
          touched: false,
          visited: false,
        })
        expect(resetListener).toHaveBeenCalled()
      })

      it('should reset with new initial value', () => {
        field.reset(nextInitial)
        expect(field).toMatchObject({
          initial: nextInitial,
          value: nextInitial,
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

  describe('array of object', () => {
    type Obj = { city: string }
    const forbidInnerParis: Validate<Obj[]> = (cities) => cities?.flatMap(({ city }) => forbidParis(city)) ?? []
    const forbidInnerParisStub = jest.fn(() => [])
    const onInit = jest.fn()
    const resetListener = jest.fn()
    const makeField = (init: Obj[]) =>
      array(object({ city: cityFieldFactory }), {
        validators: [forbidInnerParis, forbidInnerParisStub],
        onInit,
      }).create(init, injected)

    it('should add a value', () => {
      const field = makeField([{ city: 'Luanda' }])
      field.add({ city: 'Maputo' })
      expect(field.value).toEqual([{ city: 'Luanda' }, { city: 'Maputo' }])
    })

    describe('reset', () => {
      let field!: InferField<Obj[]>
      const initial = [{ city: 'Paris' }, { city: 'Luanda' }]
      const nextInitial = [{ city: 'Athènes' }, { city: 'Vilnius' }]
      beforeEach(() => {
        field = makeField(initial)
        field.on('reset', resetListener)
        field.change([{ city: 'Amsterdam' }])
      })

      it('should return to its initial state', () => {
        field.reset()
        field.validate()
        expect(field).toMatchObject({
          initial,
          value: initial,
          errors: [{ message: 'Cannot contain "Paris"' }],
          valid: false,
          dirty: false,
          pristine: true,
          touched: false,
          visited: false,
        })
        expect(resetListener).toHaveBeenCalled()
      })

      it('should reset with new initial value', () => {
        field.reset(nextInitial)
        expect(field).toMatchObject({
          initial: nextInitial,
          value: nextInitial,
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

  describe('object of array of object', () => {
    type Obj = { cities: string[] }
    const forbidInnerParis: Validate<Obj[]> = (forms) => forms?.flatMap(({ cities }) => cities.flatMap(forbidParis)) ?? []
    const forbidInnerParisStub = jest.fn(() => [])
    const onInit = jest.fn()
    const makeField = (init: Obj[]) =>
      array(
        object({
          cities: array(cityFieldFactory),
        }),
        {
          validators: [forbidInnerParis, forbidInnerParisStub],
          onInit,
        },
      ).create(init, injected)

    it('should add a value', () => {
      const field = makeField([{ cities: ['Luanda'] }])
      field.fields[0].fields.cities.add('Maputo')
      expect(field.value).toEqual([{ cities: ['Luanda', 'Maputo'] }])
      field.add({ cities: ['Prague', 'Budapest'] })
      expect(field.value).toEqual([{ cities: ['Luanda', 'Maputo'] }, { cities: ['Prague', 'Budapest'] }])
    })

    describe('first "cities" field', () => {
      it('should have a name with matching index', () => {
        const field = makeField([{ cities: ['Paris'] }, { cities: ['Luanda'] }])
        expect(field.fields[1].fields.cities.fields[0].name).toBe(`${injected.path.join('.')}.1.cities.0`)
      })
    })
  })
})
