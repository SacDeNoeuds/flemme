/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StandardSchemaV1 } from '@standard-schema/spec'
import type { Get, Paths } from 'type-fest'
import { removeBy, some } from './iterable'
import { clone, get, isEqual, set } from './utils'

export const formEvents = ['change', 'blur', 'focus', 'reset', 'validated', 'submit', 'submitted'] as const
export type FormEvent = (typeof formEvents)[number]
export type ValidationTriggerEvent = Exclude<FormEvent, 'validated' | 'submit' | 'submitted'>
type Listener = (data: { path: string; [Key: string]: any }) => void

export type ChangeListener<T, P extends Paths<T> | '' = ''> = '' extends P
  ? (data: { path: ''; previous: T; next: T }) => unknown
  : (data: { path: P; previous: Get<T, P & string>; next: Get<T, P & string> }) => unknown

export type FocusListener<T, P extends Paths<T> | '' = ''> = (data: { path: P }) => unknown

export type FormError<FormValues> = {
  message: string
  path: Paths<FormValues>
}
export type FormErrors<FormValues> = ReadonlyArray<FormError<FormValues>> | undefined
export type Validate<FormValues> = (values: FormValues) => FormErrors<FormValues>

export type Form<T> = {
  // readers
  readonly initialValues: T
  readonly values: T
  readonly errors: FormErrors<T>
  /**
   * `true` if every form field is valid, "valid" = "has no error".
   *
   * Requires form validation to be triggered manually via {@link Form.validate}
   * or through a validation trigger (provided in `createForm` options, see {@link CreateFormOptions.validationTriggers})
   */
  readonly isValid: boolean
  /**
   * `true` if at least one field is dirty, `false` otherwise.
   *
   * A field is "dirty" if the value is deeply equal to the initial values, no matter if the field has been "touched" or not (see {@link Form.isTouchedAt})
   */
  readonly isDirty: boolean

  /**
   * `true` if at least one field is touched, `false` otherwise.
   *
   * A field is marked as touched when it has gained focus once.
   */
  readonly isTouched: boolean

  get: <P extends Paths<T>>(path: P) => Get<T, P & string>
  getInitial: <P extends Paths<T>>(path: P) => Get<T, P & string>

  /**
   * `true` if the value is deeply equal to the initial values, no matter if the field has been "touched" or not (see {@link Form.isTouchedAt})
   * @example
   * form.isDirtyAt('user.name.first')
   */
  isDirtyAt: (path: Paths<T>) => boolean
  /**
   * A field is marked as touched when it has gained focus once.
   *
   * Only a {@link Form.reset} or {@link Form.resetAt} can mark a field as non-touched again.
   */
  isTouchedAt: (path: Paths<T>) => boolean

  /**
   * Can be used to set the whole form value or a nested value by providing a path.
   *
   * @fires change
   *
   * @example Setting the whole form value
   * form.set({ email: 'test@toto', password: 'love <3' })
   *
   * @example Setting a nested value
   * form.set('email', 'test@toto')
   * form.set('user.name.first', 'test@toto')
   */
  set: {
    (value: T): void
    <P extends Paths<T>>(path: P, value: Get<T, P & string> | undefined): void
  }

  /**
   * resets the form to its initial values and marks every field as not-touched
   *
   * @fires reset
   */
  reset: (nextInitialValue?: T) => void
  /**
   * resets the field to its initial values and marks the field as not-touched
   *
   * @fires reset
   */
  resetAt: <P extends Paths<T>>(path: P, nextInitialValue?: Get<T, P & string>) => void

  /**
   * Triggers validation if {@link CreateFormOptions} `validationTriggers` includes the value `'blur'`
   */
  blur: (path: Paths<T>) => void
  /**
   * Marks the field as `touched` (see {@link Form.isTouchedAt})
   *
   * @fires focus
   * @fires validated if {@link CreateFormOptions.validationTriggers} includes the value `'focus'`
   */
  focus: (path: Paths<T>) => void

  on: {
    /**
     * @event change
     * @example
     * const initialValues = { name: { first: 'John', last: 'Doe' } }
     * const form = createForm({ initialValues, … })
     *
     * // will be triggered any time a value changes
     * form.on('change', ({ previous, next }) => {})
     *
     * // will be triggered only when `name`, `name.first` or `name.last` changes.
     * form.on('change', 'name', ({ previous, next }) => {})
     */
    <P extends Paths<T>>(event: 'change', path: P, listener: ChangeListener<T, P>): () => void
    (event: 'change', listener: ChangeListener<T>): () => void

    /**
     * @event reset
     * @example
     * const initialValues = { name: { first: 'John', last: 'Doe' } }
     * const form = createForm({ initialValues, … })
     *
     * form.on('reset', 'name.first', ({ previous, next }) => {})
     *
     * form.set('name.first', 'Jane')
     * // Event will be triggered by:
     * form.resetAt('name.first')
     * form.resetAt('name')
     * form.reset()
     */
    <P extends Paths<T>>(event: 'reset', path: P, listener: ChangeListener<T, P>): () => void
    (event: 'reset', listener: ChangeListener<T>): () => void

    /**
     * @event focus
     * @example
     * const initialValues = { name: { first: 'John', last: 'Doe' } }
     * const form = createForm({ initialValues, … })
     *
     * form.on('focus', 'name.first', ({ path }) => {})
     *
     * // the event is triggered by:
     * form.focus('name.first')
     */
    <P extends Paths<T>>(event: 'focus', path: P, listener: FocusListener<T, P>): () => void
    (event: 'focus', listener: FocusListener<T>): () => void

    /**
     * @event blur
     * @example
     * const initialValues = { name: { first: 'John', last: 'Doe' } }
     * const form = createForm({ initialValues, … })
     *
     * form.on('blur', 'name.first', ({ path }) => {})
     *
     * // the event is triggered by:
     * form.blur('name.first')
     */
    <P extends Paths<T>>(event: 'blur', path: P, listener: FocusListener<T, P>): () => void
    (event: 'blur', listener: FocusListener<T>): () => void

    /**
     * @event validated
     * @example
     * const initialValues = { name: { first: 'John', last: 'Doe' } }
     * const form = createForm({ initialValues, … })
     *
     * form.on('validated', 'name.first', ({ path }) => {})
     */
    (event: 'validated', listener: () => unknown): () => void

    /**
     * @event submit
     *
     * Triggered only if the form is valid, before executing {@link CreateFormOptions.submit}
     *
     * See {@link Form.submit} for more details
     */
    (event: 'submit', listener: (data: { values: T }) => unknown): () => void

    /**
     * @event submitted
     *
     * Triggered after executing {@link CreateFormOptions.submit} succeeded
     *
     * See {@link Form.submit} for more details
     */
    (event: 'submitted', listener: (data: { values: T; error?: unknown }) => unknown): () => void
  }

  // form actions/operations:
  /**
   * Submit:
   * 1. Validates the form
   * 2. Triggers the provided {@link CreateFormOptions.submit} function
   * 3. If submit succeeds
   *    - Resets form after success (see {@link reset} and {@link resetAt})
   *    - Restores user action performed while submitting if any (ie: touched fields)
   *
   * @fires validated through programmatic {@link Form.validate}
   * @fires submit only if the form is valid and BEFORE running {@link CreateFormOptions.submit}
   * @fires submitted AFTER {@link CreateFormOptions.submit} succeeded
   * @fires reset upon submission success
   */
  submit: () => Promise<unknown>
  /**
   * Programmatically validates the form and set the errors if any
   *
   * @fires validated
   */
  validate: () => void
}

export type CreateFormOptions<T, Parsed> = {
  initialValues: T
  schema: StandardSchemaV1<T, Parsed>
  /**
   * defines when to perform validation checks
   */
  validationTriggers?: readonly ValidationTriggerEvent[]
  submit: (values: Parsed) => Promise<unknown>
}

export function createForm<T, Parsed>(options: CreateFormOptions<T, Parsed>): Form<T> {
  const { schema, validationTriggers = [] } = options
  // readers
  let initialValue = clone(options.initialValues)
  let values = clone(initialValue)
  const changesWhileSubmitting = new Map<string, any>()
  const touched = new Set<string>()
  const touchedWhileSubmitting = new Set<string>()
  let submitting = false

  // validation
  let errors: FormErrors<T> = undefined

  // events
  const listeners: Record<FormEvent, Set<Listener>> = {
    blur: new Set(),
    change: new Set(),
    focus: new Set(),
    reset: new Set(),
    validated: new Set(),
    submit: new Set(),
    submitted: new Set(),
  }

  const emit = (event: FormEvent, data: any) => {
    listeners[event].forEach((listener) => listener(data))
  }

  const form: Form<T> = {
    // readers
    get initialValues() {
      return initialValue
    },
    get values() {
      return values
    },
    get errors() {
      return errors
    },
    get isValid() {
      return errors === undefined
    },
    get isDirty() {
      return !isEqual(values, initialValue)
    },
    get isTouched() {
      return touched.size > 0
    },

    get: (path: Paths<T>): any => get(values, path as never),
    getInitial: (path: Paths<T>): any => get(initialValue, path as never),

    isDirtyAt: (path: Paths<T>) => !isEqual(get(values, path as never), get(initialValue, path as never)),

    isTouchedAt: (path: Paths<T>) => some(touched, (subpath) => subpath.startsWith(path as any)),

    // actions/operations
    set: (...args: any[]) => (args.length === 1 ? changeForm(args[0]) : changeField(args[0], args[1])),

    blur: (path: Paths<T>) => {
      emit('blur', { path })
    },
    focus: (path: Paths<T>) => {
      touched.add(path as string)
      if (submitting) touchedWhileSubmitting.add(path as string)
      emit('focus', { path })
    },
    reset: (nextInitial: any = initialValue) => {
      if (submitting) throw new Error('cannot reset form while submitting')
      const previous = initialValue
      initialValue = clone(nextInitial)
      values = clone(nextInitial)
      touched.clear()
      errors = undefined
      emit('reset', { path: '', previous, next: initialValue })
    },
    resetAt: (...args: any[]) => {
      const [path, fieldValue] = args
      const previous = get(initialValue, path as never)
      if (fieldValue) set(initialValue, path as never, fieldValue as never)
      const next = get(initialValue, path as never)
      set(values, path as never, next)

      removeBy(touched, (value) => value.startsWith(path))
      emit('reset', { path, previous, next })
    },

    // listeners
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    on: (
      ...args: [event: FormEvent, listener: Listener] | [event: FormEvent, path: `${Paths<T>}`, listener: Listener]
    ) => (args.length === 2 ? onForm(...args) : onField(...args)),

    submit: async (): Promise<any> => {
      const parsed = validate()
      if (form.errors) throw new Error('invalid form data')
      submitting = true
      const snapshot = parsed!
      try {
        emit('submit', { values: snapshot })
        const result = await options.submit(snapshot)
        submitting = false
        emit('submitted', { values: snapshot, error: undefined })
        form.reset(form.values)
        return result
      } catch (error) {
        emit('submitted', { values: snapshot, error })
      } finally {
        submitting = false
        restoreInteractionsWhileSubmitting()
      }
    },
    validate: () => {
      validate()
    },
  }

  const validate = () => {
    const result = schema['~standard'].validate(values)
    if (result instanceof Promise) throw new Error('async validation is not supported')
    errors = result.issues?.map((issue) => ({
      message: issue.message,
      path: (issue.path?.map((segment) => (segment as any).key ?? segment).join('.') ?? '') as Paths<T>,
    }))
    emit('validated', {})
    return 'value' in result ? result.value : undefined
  }

  const changeForm = (nextValue: any) => {
    const previous = values
    values = clone(nextValue)
    if (submitting) changesWhileSubmitting.set('', nextValue)
    emit('change', { path: '', previous, next: values })
  }
  const changeField = (path: string, nextValue: any) => {
    const previous = get(values, path as never)
    set(values, path as never, nextValue as never)
    if (submitting) changesWhileSubmitting.set(path, nextValue)
    emit('change', { path, previous, next: nextValue })
  }
  const onForm = (event: FormEvent, listener: Listener) => {
    listeners[event].add(listener)
    return () => listeners[event].delete(listener)
  }
  const onField = (event: FormEvent, path: string, listener: Listener) => {
    const proxy: Listener = (data: { path: string }) => {
      if (!data.path || data.path.startsWith(path)) listener(data)
    }
    listeners[event].add(proxy)
    return () => listeners[event].delete(proxy)
  }

  const restoreInteractionsWhileSubmitting = () => {
    touchedWhileSubmitting.forEach((path) => touched.add(path))
    touchedWhileSubmitting.clear()
    changesWhileSubmitting.forEach((value, path) => form.set(path as any, value))
    changesWhileSubmitting.clear()
  }

  validationTriggers.forEach((event) => {
    form.on(event as any, () => form.validate())
  })

  return form
}
