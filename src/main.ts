/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Get, PartialDeep } from 'type-fest'
import { some, removeBy } from './lib/iterable'

export { add, remove } from './lib/iterable'

export type GetFn = (target: any, path: string, defaultValue?: any) => any
export type SetFn = (target: any, path: string, value: any) => void
export type IsEqualFn = (a: any, b: any) => boolean
export type CloneDeepFn = <T>(value: T) => T
export type MakeLibParams = {
  get: GetFn
  set: SetFn
  isEqual: IsEqualFn
  cloneDeep: CloneDeepFn
}

export const formEvents = ['change', 'blur', 'focus', 'reset', 'validated'] as const
export type FormEvent = typeof formEvents[number]
type Listener = (path: string | undefined) => void

export type Validate<Errors, FormValue> = (value: PartialDeep<FormValue> | undefined) => Errors | undefined

export type Path = string

export type Form<T, ValidationErrors = any> = {
  // readers
  initial(): PartialDeep<T> | undefined
  initial<P extends string>(path: P): PartialDeep<Get<T, P>>

  value(): T | undefined
  value<P extends string>(path: P): PartialDeep<Get<T, P>>

  isDirty(path?: Path): boolean
  isModified(path?: Path): boolean
  isVisited(path?: Path): boolean
  isActive(path?: Path): boolean

  // actions/operations
  change(value: T | undefined): void
  change<P extends Path>(path: P, value: PartialDeep<Get<T, P>> | undefined): void

  reset(nextInitialValue?: T): void
  resetAt<P extends Path>(path: P, nextInitialValue?: PartialDeep<Get<T, P>>): void

  blur(path: Path): void
  focus(path: Path): void

  // events
  on(path: Path, event: FormEvent, listener: () => void): void
  on(event: FormEvent, listener: () => void): void

  off(event: FormEvent, listener: () => void): void

  // form actions/operations:
  /** Submit:
   * 1. Set all paths as modified & visited
   * 2. Reset after success
   * 3. Restore user action performed while submitting if some
   */
  submit(handler: (value: T) => Promise<any>): Promise<void>
  validate(): void
  errors(): ValidationErrors | undefined
  isValid(): boolean
}

type MakeFormOptions<T, ValidationErrors> = {
  initial: PartialDeep<T>
  validate?: Validate<ValidationErrors, T>
  validationTriggers?: Exclude<FormEvent, 'validated'>[]
}
type MakeForm = <T, ValidationErrors = any>(options: MakeFormOptions<T, ValidationErrors>) => Form<T, ValidationErrors>

export const makeLib = ({ get, set, isEqual, cloneDeep }: MakeLibParams): MakeForm => {
  const makeForm = <T, ValidationErrors>({ initial, validate = () => undefined, validationTriggers = [] }: MakeFormOptions<T, ValidationErrors>): Form<T, ValidationErrors> => {
    // readers
    let initialValue = cloneDeep(initial)
    let value = cloneDeep(initialValue)
    const modified = new Set<string>()
    const modificationsWhileSubmitting = new Map<string, any>()
    const visited = new Set<string>()
    const visitedWhileSubmitting = new Set<string>()
    let submitted = false
    let active: string | undefined = undefined

    // validation
    let errors: ValidationErrors | undefined = undefined

    // events
    const listeners: Record<FormEvent, Listener[]> = {
      blur: [],
      change: [],
      focus: [],
      reset: [],
      validated: [],
    }
    const listenerProxies = new WeakMap<() => void, Listener>()
    const emit = (event: FormEvent, path: string | undefined) => listeners[event].forEach((listener) => listener(path))

    const form: Form<T, ValidationErrors> = {
      // readers
      initial: (path?: Path): any => (path === undefined ? initialValue : get(initialValue, path)),
      value: (path?: Path): any => (path === undefined ? value : get(value, path)),
      isDirty: (path?: Path) => !isEqual(form.value(path as any), form.initial(path as any)),
      isActive: (path?: Path) => (path ? !!active?.startsWith(path) : !!active),
      isModified: (path?: Path) => {
        if (submitted) return true
        if (!path) return modified.size > 0
        return some(modified, (subpath) => subpath.startsWith(path))
      },
      isVisited: (path?: Path) => {
        if (submitted) return true
        if (!path) return visited.size > 0
        return some(visited, (subpath) => subpath.startsWith(path))
      },

      // actions/operations
      change: (...args: any[]) => (args.length === 1 ? changeForm(args[0]) : changeField(args[0], args[1])),
      blur: (path: Path) => {
        active = undefined
        emit('blur', path)
      },
      focus: (path: Path) => {
        active = path
        visited.add(path)
        if (submitted) visitedWhileSubmitting.add(path)
        emit('focus', path)
      },
      reset: (nextInitial: any = initialValue) => {
        initialValue = cloneDeep(nextInitial)
        value = cloneDeep(nextInitial)
        submitted = false
        modified.clear()
        visited.clear()
        errors = undefined
        active = undefined
        emit('reset', undefined)
      },
      // reset: (path: PathShape, value: any = nothing) => {
      resetAt: (...args: any[]) => {
        const [path, fieldValue] = args
        const hasValue = args.length === 2
        if (hasValue) set(initialValue, path, fieldValue)
        set(value, path, get(initialValue, path))

        removeBy(modified, (value) => value.startsWith(path))
        removeBy(visited, (value) => value.startsWith(path))
        submitted = false
        if (active?.startsWith(path)) active = undefined
        emit('reset', path)
      },

      // listeners
      on: (pathOrEvent: any, eventOrListener: any, listenerOrNothing?: any) =>
        listenerOrNothing === undefined ? onForm(pathOrEvent, eventOrListener) : onField(pathOrEvent, eventOrListener, listenerOrNothing),
      off: (event, listener) => off(event, listener),

      submit: async (handler: (value: T) => Promise<any>): Promise<void> => {
        submitted = true
        form.validate()
        if (!form.isValid()) throw new Error('invalid form data')
        return handler(form.value() as T)
          .then(() => form.reset(form.value()))
          .finally(() => restoreInteractionsWhileSubmitting())
      },
      validate: () => {
        errors = validate(value)
        emit('validated', undefined)
      },
      errors: () => errors,
      isValid: () => errors === undefined,
    }

    const changeForm = (nextValue: any) => {
      value = cloneDeep(nextValue)
      modified.add('')
      emit('change', undefined)
    }
    const changeField = (path: string, nextValue: any) => {
      set(value, path, nextValue)
      modified.add(path)
      if (submitted) modificationsWhileSubmitting.set(path, nextValue)
      emit('change', path)
    }
    const onForm = (event: FormEvent, listener: () => void) => {
      const proxy = () => listener()
      listenerProxies.set(listener, proxy)
      listeners[event].push(proxy)
    }
    const onField = (path: string, event: FormEvent, listener: () => void) => {
      const proxy: Listener = (emittedPath: string | undefined) => {
        if (!emittedPath || emittedPath.startsWith(path)) listener()
      }
      listenerProxies.set(listener, proxy)
      listeners[event].push(proxy)
    }
    const off = (event: FormEvent, listener: () => void) => {
      const proxy = listenerProxies.get(listener)
      listeners[event] = listeners[event].filter((listener) => listener !== proxy)
    }

    const restoreInteractionsWhileSubmitting = () => {
      visitedWhileSubmitting.forEach((path) => visited.add(path))
      visitedWhileSubmitting.clear()
      modificationsWhileSubmitting.forEach((value, path) => form.change(path, value))
      modificationsWhileSubmitting.clear()
    }

    validationTriggers.forEach((event) => {
      form.on(event, () => form.validate())
    })

    return form
  }

  return makeForm
}
