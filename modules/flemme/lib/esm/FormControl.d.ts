export interface FormControl<T, Errors> {
  readonly value: T
  readonly initial: T
  readonly isDirty: boolean
  readonly isActive: boolean
  readonly isModified: boolean
  readonly isVisited: boolean
  readonly errors: Errors | undefined
  change: (nextValue: T) => void
  reset: (nextInitialValue?: T) => void
  focus: () => void
  blur: () => void
  validate: () => void
  on: (event: FormEvent, listener: (control: FormControl<T, Errors>) => unknown) => () => void
}
type FormEvent = 'change' | 'reset' | 'focus' | 'blur' | 'validated'
export declare function FormControl<T, Errors>(options: {
  initial: T
  path?: string
  validate?: (value: T) => Errors | undefined
  isEqual: (a: T, b: T) => boolean
}): FormControl<T, Errors>
export {}
