/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Get, PartialDeep } from 'type-fest'
import { some, removeBy } from './lib/iterable'

export type GetFn = (target: any, path: string, defaultValue?: any) => any
export type SetFn = (target: any, path: string, value?: any) => void
export type IsEqualFn = (a: any, b: any) => boolean
export type CloneDeep = <T>(value: T) => T
export type MakeLibParams<Get extends GetFn, Set extends SetFn, IsEqual extends IsEqualFn> = {
  get: Get
  set: Set
  isEqual: IsEqual
  cloneDeep: CloneDeep
}

export type FormEvent = 'change' | 'blur' | 'focus' | 'reset' | 'validated'
type Listener = (path: string | undefined) => void

type Validate<E, T> = (value: PartialDeep<T> | undefined) => E | undefined

export type Path = string

export type Form<T, ValidationErrors = any> = {
  // readers
  initial(): PartialDeep<T> | undefined
  initial<P extends string>(path: P): PartialDeep<Get<T, P>>

  value(): T | undefined
  value<P extends string>(path: P): PartialDeep<Get<T, P>>

  isDirty(): boolean
  isDirty(path: Path): boolean

  isModified(): boolean
  isModified(path: Path): boolean

  isVisited(): boolean
  isVisited(path: Path): boolean

  isActive(): boolean
  isActive(path: Path): boolean

  // actions/operations
  change(value: T | undefined): void
  change<P extends Path>(path: P, value: PartialDeep<Get<T, P>> | undefined): void

  resetForm(value?: T): void
  reset<P extends Path>(path: P, value?: PartialDeep<Get<T, P>>): void

  blur(path: Path): void
  focus(path: Path): void

  // events
  on(path: Path, event: FormEvent, listener: () => void): void
  on(event: FormEvent, listener: () => void): void

  off(event: FormEvent, listener: () => void): void

  // form actions/operations:
  /**
   * 1. Set all paths as modified & visited
   * 2. Reset after success
   */
  submit(handler: (value: T) => Promise<any>): Promise<void>
  validate(): void
  errors(): ValidationErrors | undefined
  isValid(): boolean
}

type MakeFormOptions<T, ValidationErrors> = {
  initial?: PartialDeep<T>
  validate?: Validate<ValidationErrors, T>
  validationTriggers?: Exclude<FormEvent, 'validated'>[]
}
type MakeForm = <T, ValidationErrors = any>(options: MakeFormOptions<T, ValidationErrors>) => Form<T, ValidationErrors>

export const makeLib = <Get extends GetFn, Set extends SetFn, IsEqual extends IsEqualFn>({ get, set, isEqual, cloneDeep }: MakeLibParams<Get, Set, IsEqual>): MakeForm => {
  const makeForm = <T, ValidationErrors>({
    initial = undefined,
    validate = () => undefined,
    validationTriggers = [],
  }: MakeFormOptions<T, ValidationErrors>): Form<T, ValidationErrors> => {
    let initialValue = cloneDeep(initial ?? ({} as any))
    let errors: ValidationErrors | undefined
    const modified = new Set<string>()
    const visited = new Set<string>()
    let submitted = false
    let active: string | undefined = undefined
    let value = cloneDeep(initialValue ?? ({} as any))
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
      isActive: (path?: Path) => (path ? !!active?.includes(path) : !!active),
      isModified: (path?: Path) => {
        if (submitted) return true
        if (!path) return modified.size > 0
        return some(modified, (subpath) => subpath.includes(path))
      },
      isVisited: (path?: Path) => {
        if (submitted) return true
        if (!path) return modified.size > 0
        return some(visited, (subpath) => subpath.includes(path))
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
        emit('focus', path)
      },
      resetForm: (nextInitial?: any) => {
        initialValue = cloneDeep(nextInitial)
        value = cloneDeep(nextInitial)
        submitted = false
        modified.clear()
        visited.clear()
        active = undefined
        emit('reset', undefined)
      },
      // reset: (path: PathShape, value: any = nothing) => {
      reset: (...args: any[]) => {
        const [path, value] = args
        const hasValue = args.length === 2
        removeBy(modified, (value) => value.includes(path))
        removeBy(visited, (value) => value.includes(path))
        submitted = false
        if (active?.includes(path)) active = undefined
        set(value, path, hasValue ? value : get(initialValue, path))
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
        await handler(form.value() as T)
        form.resetForm(form.value())
      },
      validate: () => {
        errors = validate(value)
        emit('validated', undefined)
      },
      errors: () => errors,
      isValid: () => errors === undefined,
    }

    const changeForm = (nextValue: any) => {
      value = nextValue
      emit('change', undefined)
    }
    const changeField = (path: string, nextValue: any) => {
      set(value, path, nextValue)
      console.info('emit change', path, nextValue, value)
      emit('change', path)
    }
    const onForm = (event: FormEvent, listener: () => void) => {
      const proxy = () => listener()
      listenerProxies.set(listener, proxy)
      listeners[event].push(proxy)
    }
    const onField = (path: string, event: FormEvent, listener: () => void) => {
      const proxy: Listener = (emittedPath: string | undefined) => {
        if (!emittedPath || emittedPath.includes(path)) listener()
      }
      listenerProxies.set(listener, proxy)
      listeners[event].push(proxy)
    }
    const off = (event: FormEvent, listener: () => void) => {
      const proxy = listenerProxies.get(listener)
      if (!proxy) return
      listeners[event].splice(listeners[event].indexOf(proxy), 1)
    }

    validationTriggers.forEach((event) => {
      form.on(event, () => form.validate())
    })

    return form
  }

  return makeForm
}
