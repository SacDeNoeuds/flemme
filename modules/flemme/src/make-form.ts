/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Get, Paths } from 'type-fest'
import { removeBy, some } from './iterable'

export type GetFn = (target: any, path: string, defaultValue?: any) => any
export type SetFn = (target: any, path: string, value: any) => void
export type IsEqualFn = (a: any, b: any) => boolean
export type CloneDeepFn = <T>(value: T) => T
export type FlemmeParams = {
  get: GetFn
  set: SetFn
  isEqual: IsEqualFn
  cloneDeep: CloneDeepFn
}

export const formEvents = ['change', 'blur', 'focus', 'reset', 'validated', 'submit', 'submitted'] as const
export type FormEvent = (typeof formEvents)[number]
export type ValidationTriggerEvent = Exclude<FormEvent, 'validated' | 'submit' | 'submitted'>
type Listener = (data: { path: string; [Key: string]: any }) => void

export type ChangeListener<T, P extends Paths<T> | '' = ''> = '' extends P
  ? (data: { path: ''; previous: T; next: T }) => unknown
  : (data: { path: P; previous: Get<T, P & string>; next: Get<T, P & string> }) => unknown

export type FocusListener<T, P extends Paths<T> | '' = ''> = (data: { path: P }) => unknown
export type ValidatedListener<Errors> = (data: { errors: Errors | undefined }) => unknown

export type Validate<Errors, FormValue> = (value: FormValue) => Errors | undefined

export type Form<T, ValidationErrors = any> = {
  // readers
  readonly initialValues: T
  readonly values: T
  readonly errors: ValidationErrors | undefined
  readonly isValid: boolean
  readonly isDirty: boolean

  get<P extends Paths<T>>(path: P): Get<T, P & string>

  isDirtyAt(path: Paths<T>): boolean
  isVisited(path?: Paths<T>): boolean

  // actions/operations
  set: {
    (value: T): void
    <P extends Paths<T>>(path: P, value: Get<T, P & string> | undefined): void
  }

  reset: (nextInitialValue?: T) => void
  resetAt: <P extends Paths<T>>(path: P, nextInitialValue?: Get<T, P & string>) => void

  blur: (path: Paths<T>) => void
  focus: (path: Paths<T>) => void

  // events
  on: {
    <P extends Paths<T>>(event: 'reset' | 'change', path: P, listener: ChangeListener<T, P>): () => void
    (event: 'reset' | 'change', listener: ChangeListener<T>): () => void
    <P extends Paths<T>>(event: 'focus' | 'blur', path: P, listener: FocusListener<T, P>): () => void
    (event: 'focus' | 'blur', listener: FocusListener<T>): () => void
    (event: 'validated', listener: ValidatedListener<ValidationErrors>): () => void
    (event: 'submit', listener: (data: { values: T }) => unknown): () => void
    (event: 'submitted', listener: (data: { values: T; error?: unknown }) => unknown): () => void
  }

  // form actions/operations:
  /** Submit:
   * 1. Set all paths as modified & visited
   * 2. Reset after success
   * 3. Restore user action performed while submitting if some
   */
  submit: () => Promise<unknown>
  validate: () => void
}

type CreateFormOptions<T, ValidationErrors> = {
  initial: T
  validate?: Validate<ValidationErrors, T>
  validationTriggers?: ValidationTriggerEvent[]
  submit: (values: T) => Promise<unknown>
}
export type CreateForm = <T, ValidationErrors = any>(
  options: CreateFormOptions<T, ValidationErrors>,
) => Form<T, ValidationErrors>

export function Flemme({ get, set, isEqual, cloneDeep }: FlemmeParams): CreateForm {
  return function createForm<T, ValidationErrors>(
    options: CreateFormOptions<T, ValidationErrors>,
  ): Form<T, ValidationErrors> {
    const { validate = () => undefined, validationTriggers = [] } = options
    // readers
    let initialValue = cloneDeep(options.initial)
    let values = cloneDeep(initialValue)
    const changesWhileSubmitting = new Map<string, any>()
    const visited = new Set<string>()
    const visitedWhileSubmitting = new Set<string>()
    let submitting = false

    // validation
    let errors: ValidationErrors | undefined = undefined

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

    const form: Form<T, ValidationErrors> = {
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

      get: (path: Paths<T>): any => get(values, path as string),

      isDirtyAt: (path: Paths<T>) => !isEqual(get(values, path as string), get(initialValue, path as string)),

      isVisited: (path?: Paths<T>) => {
        if (!path) return visited.size > 0
        return some(visited, (subpath) => subpath.startsWith(path as any))
      },

      // actions/operations
      set: (...args: any[]) => (args.length === 1 ? changeForm(args[0]) : changeField(args[0], args[1])),

      blur: (path: Paths<T>) => {
        emit('blur', { path })
      },
      focus: (path: Paths<T>) => {
        visited.add(path as string)
        if (submitting) visitedWhileSubmitting.add(path as string)
        emit('focus', { path })
      },
      reset: (nextInitial: any = initialValue) => {
        if (submitting) throw new Error('cannot reset form while submitting')
        const previous = initialValue
        initialValue = cloneDeep(nextInitial)
        values = cloneDeep(nextInitial)
        visited.clear()
        errors = undefined
        emit('reset', { path: '', previous, next: initialValue })
      },
      resetAt: (...args: any[]) => {
        const [path, fieldValue] = args
        const previous = get(initialValue, path)
        if (fieldValue) set(initialValue, path, fieldValue)
        const next = get(initialValue, path)
        set(values, path, next)

        removeBy(visited, (value) => value.startsWith(path))
        emit('reset', { path, previous, next })
      },

      // listeners
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      on: (
        ...args: [event: FormEvent, listener: Listener] | [event: FormEvent, path: `${Paths<T>}`, listener: Listener]
      ) => (args.length === 2 ? onForm(...args) : onField(...args)),

      submit: async (): Promise<any> => {
        form.validate()
        if (form.errors) throw new Error('invalid form data')
        submitting = true
        const snapshot = values
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
        errors = validate(values)
        emit('validated', { errors })
      },
    }

    const changeForm = (nextValue: any) => {
      const previous = values
      values = cloneDeep(nextValue)
      if (submitting) changesWhileSubmitting.set('', nextValue)
      emit('change', { path: '', previous, next: values })
    }
    const changeField = (path: string, nextValue: any) => {
      const previous = get(values, path)
      set(values, path, nextValue)
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
      visitedWhileSubmitting.forEach((path) => visited.add(path))
      visitedWhileSubmitting.clear()
      changesWhileSubmitting.forEach((value, path) => form.set(path as any, value))
      changesWhileSubmitting.clear()
    }

    validationTriggers.forEach((event) => {
      form.on(event as any, () => form.validate())
    })

    return form
  }
}
