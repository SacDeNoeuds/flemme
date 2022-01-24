import { InferField, InjectedData } from './common'
import { primitive } from './primitive'
import { forbidString } from './spec-helpers'

describe('primitive field', () => {
  const injected: InjectedData = { validateOn: ['blur'], path: ['city'] }
  const forbidTokyo = forbidString('Tokyo')
  const validate = jest.fn(() => [])
  const field = (value: string) => primitive(forbidTokyo, validate).create(value, injected)

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should have a valid initial state', () => {
    const initial = 'Hello world'
    expect(field(initial)).toMatchObject({
      name: injected.path.join('.'),
      initial,
      value: initial,
      errors: [],
      valid: true,
      dirty: false,
      pristine: true,
      touched: false,
      visited: false,
      // modified: false,
      // modifiedSinceLastSubmit: false,
    })
  })

  describe('validation', () => {
    const invalidInitial = 'Go to Tokyo'
    it('should have valid state with invalid initial value', () => {
      expect(field(invalidInitial)).toMatchObject({
        initial: invalidInitial,
        value: invalidInitial,
        errors: [],
        valid: true,
        dirty: false,
        pristine: true,
        touched: false,
        visited: false,
      })
    })

    it('should have invalid state after running validation', () => {
      const cityField = field(invalidInitial)
      cityField.validate()
      expect(cityField).toMatchObject({
        initial: invalidInitial,
        value: invalidInitial,
        errors: [{ message: 'Cannot contain "Tokyo"' }],
        valid: false,
        dirty: false,
        pristine: true,
        touched: false,
        visited: false,
      })
    })

    it('should run validate function', () => {
      field('Singapour').validate()
      expect(validate).toHaveBeenCalledWith('Singapour')
    })
  })

  describe('interactions', () => {
    const initial = 'Paris'
    const changeListener = jest.fn()
    const focusListener = jest.fn()
    const blurListener = jest.fn()
    const resetListener = jest.fn()
    let cityField!: InferField<string>
    let unlistenChange!: () => void
    beforeEach(() => {
      cityField = field(initial)
      unlistenChange = cityField.on('change', changeListener)
      cityField.on('focus', focusListener)
      cityField.on('blur', blurListener)
      cityField.on('reset', resetListener)
    })
    describe('focus', () => {
      beforeEach(() => cityField.focus())
      it('should be active', () => expect(cityField.active).toBe(true))
      it('should be visited', () => expect(cityField.visited).toBe(true))
      it('should trigger "focus" listener', () => expect(focusListener).toHaveBeenCalledWith(cityField))

      describe('blur', () => {
        beforeEach(() => {
          jest.resetAllMocks()
          cityField.blur()
        })
        it('should not be active', () => expect(cityField.active).toBe(false))
        it('should remain visited', () => expect(cityField.visited).toBe(true))
        it('should trigger "blur" listener', () => expect(blurListener).toHaveBeenCalledWith(cityField))
        it('should validate field', () => expect(validate).toHaveBeenCalledTimes(1))
      })
    })

    describe('change to same value', () => {
      beforeEach(() => cityField.change(initial))
      it('should remain pristine', () => expect(cityField.pristine).toBe(true))
      it('should not be dirty', () => expect(cityField.dirty).toBe(false))
      it('should be marked as touched', () => expect(cityField.touched).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(cityField))
      it('should not trigger "change" listener after unlistening', () => {
        expect(changeListener).toHaveBeenCalledTimes(1)
        unlistenChange()
        cityField.change('Whatever')
        expect(changeListener).toHaveBeenCalledTimes(1)
      })
    })

    describe('change to different value', () => {
      beforeEach(() => cityField.change('New York'))
      it('should not be pristine', () => expect(cityField.pristine).toBe(false))
      it('should be dirty', () => expect(cityField.dirty).toBe(true))
      it('should be marked as touched', () => expect(cityField.touched).toBe(true))
      it('should trigger "change" listener', () => expect(changeListener).toHaveBeenCalledWith(cityField))
    })

    describe('reset', () => {
      beforeEach(() => cityField.change('Tbilissi'))

      it('should return to its initial state', () => {
        cityField.reset()
        expect(cityField).toMatchObject({
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
        cityField.reset('Luanda')
        expect(cityField).toMatchObject({
          initial: 'Luanda',
          value: 'Luanda',
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
})
