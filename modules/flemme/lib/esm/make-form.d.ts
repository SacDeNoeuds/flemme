import type { Get, PartialDeep, Paths } from 'type-fest'
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
export declare const formEvents: readonly ['change', 'blur', 'focus', 'reset', 'validated']
export type FormEvent = (typeof formEvents)[number]
export type ValidationTriggerEvent = Exclude<FormEvent, 'validated'>
export type Validate<Errors, FormValue> = (value: FormValue) => Errors | undefined
export type Path = string
export type Form<T, ValidationErrors = any> = {
  initial(): T
  initial<P extends Paths<T>>(path: P): Get<T, P & string>
  value(): T
  value<P extends Paths<T>>(path: P): Get<T, P & string>
  isDirty(path?: Paths<T>): boolean
  isVisited(path?: Paths<T>): boolean
  isActive(path?: Paths<T>): boolean
  change(value: T): void
  change<P extends Paths<T>>(path: P, value: Get<T, P & string> | undefined): void
  reset(nextInitialValue?: T): void
  resetAt<P extends Paths<T>>(path: P, nextInitialValue?: PartialDeep<Get<T, `${P}`>>): void
  blur(path: Paths<T>): void
  focus(path: Paths<T>): void
  on(path: Paths<T>, event: FormEvent, listener: () => void): () => void
  on(event: FormEvent, listener: () => void): () => void
  /** Submit:
   * 1. Set all paths as modified & visited
   * 2. Reset after success
   * 3. Restore user action performed while submitting if some
   */
  submit(): Promise<unknown>
  validate(): void
  errors(): ValidationErrors | undefined
  isValid(): boolean
}
type MakeFormOptions<T, ValidationErrors> = {
  initial: T
  validate?: Validate<ValidationErrors, T>
  validationTriggers?: ValidationTriggerEvent[]
  submit: (values: T) => Promise<unknown>
}
export type MakeForm = <T, ValidationErrors = any>(
  options: MakeFormOptions<T, ValidationErrors>,
) => Form<T, ValidationErrors>
export declare function makeLib({ get, set, isEqual, cloneDeep }: MakeLibParams): MakeForm
export {}
