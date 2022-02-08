/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { get, set, isEqual, cloneDeep } from 'lodash'
import { Form, FormEvent, makeLib } from './main'

const makeForm = makeLib({ get, set, isEqual, cloneDeep })

describe('form', () => {
  // const unhandledCases = [
  //   ['object with undefined value', undefined, { paths: [undefined, 'name'] }],
  //   ['array with undefined value', undefined, { paths: [undefined, 0, 1] }],
  //   ['primitive (string) with populated value', 'John', { paths: [undefined] }],
  //   ['primitive (string) with empty value', undefined, { paths: [undefined] }],
  //   ['primitive (number) with populated value', 12, { paths: [undefined] }],
  //   ['primitive (number) with empty value', undefined, { paths: [undefined] }],
  //   ['primitive (boolean) with "true" value', true, { paths: [undefined] }],
  //   ['primitive (boolean) with "false" value', false, { paths: [undefined] }],
  //   ['primitive (boolean) with empty value', undefined, { paths: [undefined] }],
  //   ['object of array of primitive (string) with empty value', undefined, { paths: [undefined, 'names', 'names.0', 'names.1'] }],
  //   ['array of object of primitive (string) with empty value', undefined, { paths: [undefined, '0.name', '1.name'] }],
  //   ['object of array of object of primitive (string) with empty value', undefined, { paths: [undefined, 'users', 'users.0', 'users.0.name', 'users.1', 'users.1.name'] }],
  // ]

  describe.each([
    [
      'object of primitive (string)',
      {
        initial: {
          populated: { name: 'John' },
          empty: {},
        },
        paths: [undefined, 'name'],
      },
    ],
    [
      'array of primitive (string)',
      {
        initial: {
          populated: ['a', 'b'],
          empty: [],
        },
        paths: [undefined, '1'],
      },
    ],
    [
      'object of array of primitive (string)',
      {
        initial: {
          populated: { names: ['John', 'Fred'] },
          empty: {},
        },
        paths: [undefined, 'names', 'names.1'],
      },
    ],
    [
      'array of object of primitive (string)',
      {
        initial: {
          populated: [{ name: 'John' }, { name: 'Fred' }],
          empty: [],
        },
        paths: [undefined, '0.name'],
      },
    ],
    [
      'object of array of object of primitive (string)',
      {
        initial: {
          'populated': { users: [{ name: 'John' }, { name: 'Fred' }] },
          'empty': {},
          'undefined nested array': { users: undefined },
          'empty nested array': { users: [] },
          'undefined nested array item': { users: [undefined] },
          'empty nested array item': { users: [{}] },
        },
        paths: [undefined, 'users', 'users.0', 'users.0.name', 'users.1', 'users.1.name'],
      },
    ],
    [
      'array of object of array of primitive (string)',
      {
        initial: {
          'populated': [{ names: ['John', 'Doe'] }, { names: ['Fred', 'Aster'] }],
          'empty': [],
          'undefined nested name': [{}],
        },
        paths: [undefined, '0.names', '0.names.1'],
      },
    ],
  ])('%s', (_label, options) => {
    const paths = options.paths as any[]
    const cases = Object.entries(options.initial) as Array<[string, any]>
    const deepestPath = options.paths.slice(-1)[0] as string
    const parent = options.paths.length > 2 ? options.paths[1] : undefined

    describe.each(cases)('initialisation with %s initial value', (_label, initial) => {
      const form = makeForm({ initial })
      it.each(paths)('should have correct initial value with path %s', (path) => expect(form.initial(path)).toEqual(path ? get(initial, path) : initial))
      it.each(paths)('should have correct value with path %s', (path) => expect(form.value(path)).toEqual(path ? get(initial, path) : initial))
      it('should not be active', () => expect(form.isActive()).toBe(false))
      it('should not be dirty', () => expect(form.isDirty()).toBe(false))
      it('should not be modified', () => expect(form.isModified()).toBe(false))
      it('should not be visited', () => expect(form.isVisited()).toBe(false))
      it('should have no errors', () => expect(form.errors()).toBe(undefined))
      it('should be valid', () => expect(form.isValid()).toBe(true))
    })

    describe('operations', () => {
      const initialFormValue = options.initial.empty
      const nextFormValue = options.initial.populated

      describe.each([
        ['form', { path: undefined, parent: undefined }],
        ['field', { path: deepestPath, parent }],
      ])('%s-level change', (label, { path, parent }) => {
        const nextValue = path ? get(nextFormValue, path) : nextFormValue

        describe('update to equal value', () => {
          let form!: Form<any>
          beforeEach(() => {
            form = makeForm({ initial: nextFormValue })
            path ? form.change(path, nextValue) : form.change(nextValue)
          })
          it('should update value', () => expect(form.value(path as any)).toEqual(nextValue))
          it(`should mark ${label} as not dirty`, () => expect(form.isDirty(path)).toBe(false))
          it(`should mark ${label} as modified`, () => expect(form.isModified(path)).toBe(true))

          if (path) it('should mark form as modified', () => expect(form.isModified()).toBe(true))
          if (parent) it('should mark parent as modified', () => expect(form.isModified(parent)).toBe(true))
        })

        describe('update to different value', () => {
          let form!: Form<any>
          beforeEach(() => {
            form = makeForm({ initial: initialFormValue })
            path ? form.change(path, nextValue) : form.change(nextValue)
          })
          it('should update value', () => expect(form.value(path as any)).toEqual(nextValue))
          it(`should mark ${label} as dirty`, () => expect(form.isDirty(path)).toBe(true))
          it(`should mark ${label} as modified`, () => expect(form.isModified(path)).toBe(true))
        })
      })

      describe('focus', () => {
        let form!: Form<any>
        const path = deepestPath
        beforeEach(() => {
          form = makeForm({ initial: initialFormValue })
          form.focus(path)
        })
        it('should mark field as visited', () => expect(form.isVisited(path)).toBe(true))
        it('should mark form as visited', () => expect(form.isVisited()).toBe(true))
        if (parent) it('should mark parent as visited', () => expect(form.isVisited(parent)).toBe(true))

        it('should mark field as active', () => expect(form.isActive(path)).toBe(true))
        it('should mark form as active', () => expect(form.isActive()).toBe(true))
        if (parent) it('should mark parent as active', () => expect(form.isActive(parent)).toBe(true))

        describe('then blur', () => {
          beforeEach(() => form.blur(path))
          it('should still mark field as visited', () => expect(form.isVisited(path)).toBe(true))
          it('should still mark form as visited', () => expect(form.isVisited()).toBe(true))
          if (parent) it('should still mark parent as visited', () => expect(form.isVisited(parent)).toBe(true))

          it('should mark field as inactive', () => expect(form.isActive(path)).toBe(false))
          it('should mark form as inactive', () => expect(form.isActive()).toBe(false))
          if (parent) it('should mark parent as inactive', () => expect(form.isActive(parent)).toBe(false))
        })
      })

      describe('reset form', () => {
        let form!: Form<any>
        beforeEach(() => {
          form = makeForm({ initial: initialFormValue })
          form.change(nextFormValue)
        })

        describe.each([
          ['initial value', undefined],
          ['new initial value', nextFormValue],
        ])('reset to %s', (_label, nextInitialFormValue) => {
          const initial = nextInitialFormValue ?? initialFormValue
          beforeEach(() => form.resetForm(nextInitialFormValue))

          it.each(paths)('should have correct initial value with path %s', (path) => expect(form.initial(path)).toEqual(path ? get(initial, path) : initial))
          it.each(paths)('should have correct value with path %s', (path) => expect(form.value(path)).toEqual(path ? get(initial, path) : initial))
          it('should have no errors', () => expect(form.errors()).toBe(undefined))
          it('should not be active', () => expect(form.isActive()).toBe(false))
          it('should not be dirty', () => expect(form.isDirty()).toBe(false))
          it('should not be modified', () => expect(form.isModified()).toBe(false))
          it('should not be visited', () => expect(form.isVisited()).toBe(false))
          it('should be valid', () => expect(form.isValid()).toBe(true))
        })
      })

      describe('reset field', () => {
        const path = deepestPath // string field
        const initialFormValue = nextFormValue
        let form!: Form<any>
        beforeEach(() => {
          form = makeForm({ initial: initialFormValue })
          form.change(path, 'Christina')
        })

        describe.each([
          // ['initial value', undefined],
          ['new initial value', 'Maryse'],
        ])('reset to %s', (_label, nextFieldInitialValue) => {
          const nextInitial = cloneDeep(initialFormValue)
          if (nextFieldInitialValue) set(nextInitial, path, nextFieldInitialValue)
          beforeEach(() => (nextFieldInitialValue ? form.reset(path, nextFieldInitialValue) : form.reset(path)))

          it.each(paths)('should have correct initial value with path %s', (path) => expect(form.initial(path)).toEqual(path ? get(nextInitial, path) : nextInitial))
          it.each(paths)('should have correct value with path %s', (path) => expect(form.value(path)).toEqual(path ? get(nextInitial, path) : nextInitial))

          it('should not be active', () => expect(form.isActive(path)).toBe(false))
          if (parent) it('parent should not be active', () => expect(form.isActive(parent)).toBe(false))

          it('should not be dirty', () => expect(form.isDirty(path)).toBe(false))
          if (parent) it('parent should not be dirty', () => expect(form.isDirty(parent)).toBe(false))

          it('should not be modified', () => expect(form.isModified(path)).toBe(false))
          if (parent) it('parent should not be modified', () => expect(form.isModified(parent)).toBe(false))

          it('should not be visited', () => expect(form.isVisited(path)).toBe(false))
          if (parent) it('parent should not be visited', () => expect(form.isVisited(parent)).toBe(false))
        })
      })
    })

    describe('validation', () => {
      const errors = [{ code: 'error_1' }, { code: 'error_2' }, { code: 'error_3' }]
      const fail = jest.fn(() => errors)
      const succeed = jest.fn(() => undefined)
      const initial = options.initial.populated

      it('should be valid by default at initialisation', () => expect(makeForm({ initial, validate: fail }).isValid()).toBe(true))

      describe('with valid value', () => {
        let form!: Form<any>
        beforeEach(() => {
          form = makeForm({ initial, validate: succeed })
          form.validate()
        })
        it('should have no errors', () => expect(form.errors()).toBe(undefined))
        it('should be valid', () => expect(form.isValid()).toBe(true))
      })

      describe('with invalid value', () => {
        let form!: Form<any>
        beforeEach(() => {
          form = makeForm({ initial, validate: fail })
          form.validate()
        })
        it('should have errors', () => expect(form.errors()).toEqual(errors))
        it('should be invalid', () => expect(form.isValid()).toBe(false))
      })
    })

    describe('events', () => {
      const initial = options.initial.populated
      const path = deepestPath
      let form!: Form<any>
      beforeEach(() => {
        form = makeForm({ initial })
      })
      describe.each([
        ['change', { formTrigger: () => form.change(options.initial.empty), fieldTrigger: () => form.change(path, 'Maryse') }],
        ['blur', { formTrigger: undefined, fieldTrigger: () => form.blur(path) }],
        ['focus', { formTrigger: undefined, fieldTrigger: () => form.focus(path) }],
        ['reset', { formTrigger: () => form.resetForm(), fieldTrigger: () => form.reset(path) }],
        ['validated', { formTrigger: () => form.validate(), fieldTrigger: undefined }],
      ])('%s', (formEvent_, { formTrigger, fieldTrigger }) => {
        const formEvent = formEvent_ as FormEvent
        const cases = [
          ['form-level event', { trigger: formTrigger, path: undefined }],
          ['field-level event', { trigger: fieldTrigger, path }],
          ['field-level event registered on form', { trigger: fieldTrigger, path: undefined }],
          ['field-level event registered on parent', { trigger: fieldTrigger, path: parent ?? null }],
        ].filter(([, { trigger, path }]: any) => trigger && path !== null) as Array<[string, { trigger: () => void; path: string | undefined }]>
        describe.each(cases)('%s', (_label, { trigger, path }) => {
          const listener = jest.fn()
          beforeEach(() => (path ? form.on(path, formEvent, listener) : form.on(formEvent, listener)))

          it('should trigger listener', () => {
            trigger()
            expect(listener).toHaveBeenCalledTimes(1)
          })

          it('should not trigger listener', () => {
            trigger()
            form.off(formEvent, listener)
            trigger()
            expect(listener).toHaveBeenCalledTimes(1)
          })
        })
      })
    })

    describe('submit', () => {
      describe('with invalid form', () => {
        const initial = options.initial.populated
        const handler = jest.fn(() => Promise.resolve())
        const errors = [{ code: 'error_1' }, { code: 'error_2' }]
        const validate = jest.fn(() => errors)
        let form!: Form<any>
        let submitPromise!: Promise<void>
        beforeEach(async () => {
          form = makeForm({ initial, validate })
          submitPromise = form.submit(handler)
          await submitPromise.catch(() => void 0)
        })
        it('should reject', () => expect(submitPromise).rejects.toThrow(/invalid form data/))
        it('should not call handler', () => expect(handler).not.toHaveBeenCalled())
      })

      describe('with valid form', () => {
        const initial = options.initial.empty
        const nextFormValue = options.initial.populated
        const resolved = 'toto'
        const handler = jest.fn(() => Promise.resolve(resolved))
        const validate = jest.fn(() => undefined)
        let form!: Form<any>
        let submitPromise!: Promise<void>
        beforeEach(async () => {
          form = makeForm({ initial, validate })
          form.change(nextFormValue)
          submitPromise = form.submit(handler)
          await submitPromise
        })
        it('should validate form', async () => expect(validate).toHaveBeenCalledTimes(1))
        it('should resolve to void', () => expect(submitPromise).resolves.toBe(undefined))
        it('should call handler', () => expect(handler).toHaveBeenCalledWith(form.value()))

        it('should reset form with submitted value', () => {
          const initial = nextFormValue
          paths.forEach((path) => expect(form.initial(path)).toEqual(path ? get(initial, path) : initial))
          paths.forEach((path) => expect(form.value(path)).toEqual(path ? get(initial, path) : initial))
          expect(form.errors()).toBe(undefined)
          expect(form.isActive()).toBe(false)
          expect(form.isDirty()).toBe(false)
          expect(form.isModified()).toBe(false)
          expect(form.isVisited()).toBe(false)
          expect(form.isValid()).toBe(true)
        })
      })
    })
  })
})
