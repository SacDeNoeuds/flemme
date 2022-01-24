/* eslint-disable @typescript-eslint/no-explicit-any */
import { boolean, date, oneOf, nullable, number, optional, string } from './other-factories'
import { primitive, PrimitiveField } from './primitive'
import { object, ObjectField } from './object'
import { array, ArrayField } from './array'
import { BaseDescriptor, Descriptor, InferField, InjectedData } from './common'

describe('other factories', () => {
  const injected: InjectedData = { validateOn: [], path: ['someField'] }
  const cityField = primitive<string>()
  const objectField = object({ city: cityField })
  const arrayField = array(cityField)

  describe.each([
    ['required string', { descriptor: primitive<string>(), errorsLength: 1 }],
    ['optional string', { descriptor: optional(primitive<string>()), errorsLength: 0 }],
    ['nullable string', { descriptor: nullable(primitive<string>()), errorsLength: 0 }],
  ])('nested %s field', (_, { descriptor: cityField, errorsLength }) => {
    // type Obj = { cities: Array<string | undefined | null> }
    const makeField = object({ cities: array(cityField) })
    let field: InferField<string>
    describe.each([null, undefined])('with %s', (emptyValue) => {
      beforeEach(() => {
        field = makeField.create({ cities: [emptyValue as any] }, { validateOn: [], path: [] }).fields.cities.fields[0] as InferField<string>
        field.validate()
      })
      it.each([emptyValue])('should have initial value %s', () => expect(field.initial).toBe(emptyValue))
      it.each([emptyValue])('should have value %s', () => expect(field.value).toBe(emptyValue))
      it.each([errorsLength])('should have %s errors', () => expect(field.errors).toHaveLength(errorsLength))
    })
  })

  describe.each([
    ['nullable', nullable, null],
    ['optional', optional, undefined],
  ])('With "%s" …', (_, wrapper, emptyValue) => {
    const cases: Array<[string, Descriptor<any>, any]> = [
      ['primitive', cityField, 'Tokyo'],
      ['object', objectField, { city: 'Tokyo' }],
      ['array', arrayField, ['Tokyo']],
    ]
    describe.each(cases)('… enhance "%s" factory', (_label, descriptor, demoValue) => {
      const makeField = (init: any) => wrapper(descriptor).create(init, injected)

      it.each([emptyValue, demoValue])('should accept initial value "%s"', (initialOrEmpty: any) => {
        expect(makeField(initialOrEmpty)).toMatchObject({
          name: injected.path.join('.'),
          initial: initialOrEmpty,
          value: initialOrEmpty,
          valid: true,
          pristine: true,
          touched: false,
          visited: false,
          active: false,
        })
      })

      describe.each([
        [demoValue, emptyValue],
        [emptyValue, demoValue],
      ])('change from %s to %s', (initial, next) => {
        type Field = ObjectField<any> | ArrayField<any> | PrimitiveField<any>
        let field: Field
        beforeEach(() => (field = makeField(initial)))

        it('should update field state', () => {
          const field = makeField(initial)
          field.change(next)
          expect(field).toMatchObject({
            initial,
            value: next,
            touched: true,
            pristine: false,
          })
        })

        describe('reset', () => {
          beforeEach(() => field.reset())

          it('reset field state to its original state', () => {
            expect(field).toMatchObject({
              initial,
              value: initial,
              touched: false,
              pristine: true,
            })
          })
        })
      })
    })

    describe.each([
      ['object', objectField, { city: 'Tokyo' }],
      ['array', arrayField, ['Tokyo']],
    ])('%s specificities', (_label, descriptor, demoValue) => {
      type Field = ObjectField<any> | ArrayField<any>
      type Desc = Descriptor<any>
      const makeField = (init: any) => wrapper(descriptor as Desc).create(init, injected) as Field

      describe.each([emptyValue])('with initial %s value', () => {
        let field!: Field
        beforeEach(() => (field = makeField(emptyValue)))
        it.each([emptyValue])('fields should be %s', (emptyValue) => expect(field.fields).toEqual(emptyValue))

        describe.each([demoValue])('after changing to %s', () => {
          beforeEach(() => field.change(demoValue))

          it.each([emptyValue])('fields should not be %s', () => {
            expect(field.fields).toBeDefined()
          })

          describe('and resetting', () => {
            beforeEach(() => field.reset())
            it.each([emptyValue])('fields should be %s', () => {
              expect(field.fields).toBe(emptyValue)
            })
          })
        })
      })

      describe.each([demoValue])('with initial %s value', () => {
        let field!: Field
        beforeEach(() => (field = makeField(emptyValue)))

        describe.each([emptyValue])('after changing to %s', () => {
          beforeEach(() => field.change(emptyValue))

          it.each([emptyValue])('fields should be %s', (emptyValue) => {
            expect(field.fields).toEqual(emptyValue)
          })
        })
      })
    })
  })
})

describe.each([
  ['string', string, ['hello', 'world'], [true, false, 12, new Date(), {}, []]],
  ['literal', () => oneOf(['a', 'b', 'c']), ['a', 'b', 'c'], [true, false, [], 'z', 12, {}, new Date()]],
  ['number', number, [0, 1, -4, 123], [Infinity, 'Nope', new Date(), {}, [], true, false]],
  ['date', date, [new Date()], [new Date('abc'), 'a', {}, [], 12]],
  ['boolean', boolean, [true, false], ['str', 0, 1, 12, new Date(), {}, []]],
])('built-in field %s', (_label, factory, validValues, invalidValues) => {
  const descriptor = factory() as unknown as BaseDescriptor<any>
  const makeField = (init: any) => descriptor.create(init, { validateOn: [], path: [] }) as PrimitiveField<any>

  it.each(validValues as any[])('should accept value %s', (validValue) => {
    const field = makeField(validValue)
    field.validate()
    expect(field).toMatchObject({
      initial: validValue,
      value: validValue,
      valid: true,
      pristine: true,
      dirty: false,
    })
  })

  it.each([undefined, null, ...(invalidValues as any[])])('should refuse value %s', (invalidValue) => {
    const field = makeField(invalidValue)
    field.validate()
    expect(field).toMatchObject({
      initial: invalidValue,
      value: invalidValue,
      valid: false,
      pristine: true,
      dirty: false,
    })
  })
})
