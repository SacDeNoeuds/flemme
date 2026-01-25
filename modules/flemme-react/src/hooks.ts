/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createForm,
  type CreateFormOptions,
  type Form,
  type FormErrors,
  FormEvent,
  type FlemmeGet as Get,
  type FlemmePaths as Paths,
} from 'flemme'
import { useEffect, useMemo, useState } from 'react'

export type UseForm<T, Output> = (options: Omit<CreateFormOptions<T, Output>, 'schema' | 'validationTriggers'>) => {
  readonly form: Form<T>
  readonly errors: FormErrors<T>
}

export type UseField<T> = <P extends Paths<T>>(path: P) => FieldState<T, P>

const createReactForm = <T, Output>(
  formOptions: Pick<CreateFormOptions<T, Output>, 'schema' | 'validationTriggers'>,
): [UseForm<T, Output>, UseField<T>] => {
  let form: Form<T>
  const useForm: UseForm<T, Output> = (options) => {
    form = useFormInternal({ ...formOptions, ...options })
    return {
      form,
      get errors() {
        return useFormErrors(form)
      },
    }
  }

  const useField: UseField<T> = (path) => {
    if (!form) throw new Error('you must call `useXxForm` before `useXxField` (see …)')
    return useFormField(form, path)
  }

  return [useForm, useField]
}

export { createReactForm as createForm }

const useFormInternal = <T, Output>(options: CreateFormOptions<T, Output>): Form<T> => {
  return useMemo(() => createForm(options), [options.initialValues, options.submit])
}

const useFormErrors = makeHook(['validated'], (form) => form.errors)

type UseTouched = <T, P extends Paths<T>>(form: Form<T>, path?: P) => boolean
const useTouched: UseTouched = makeHook(['focus', 'reset', 'validated'], (form, path) =>
  form.isTouchedAt(path as never),
) as any

type UseDirty = <T, P extends Paths<T>>(form: Form<T>, path?: P) => boolean
const useDirty: UseDirty = makeHook(['change', 'reset'], (form, path) =>
  path ? form.isDirty : form.isDirtyAt(path as never),
) as any

type UseValue = <T, P extends Paths<T>>(form: Form<T>, path: P) => Get<T, P & string>
const useValue: UseValue = makeHook(['change', 'reset'], (form, path) => form.get(path as never)) as any

type UseInitial = <T, P extends Paths<T>>(form: Form<T>, path: P) => Get<T, P & string>
const useInitial: UseInitial = makeHook(['change', 'reset'], (form, path) => form.getInitial(path as never)) as any

type FieldState<T, P extends Paths<T>> = ReturnType<typeof useFormField<T, P>>
const useFormField = <T, P extends Paths<T>>(form: Form<T>, path: P) => {
  return {
    path,
    get value(): Get<T, P & string> {
      return useValue(form, path)
    },
    get initial(): Get<T, P & string> {
      return useInitial(form, path)
    },
    get errors(): FormErrors<T> {
      const errors = useFormErrors(form)
      return useMemo(() => errors?.filter((error) => error.path === path), [errors, path])
    },
    get isDirty(): boolean {
      return useDirty(form, path)
    },
    get isTouched(): boolean {
      return useTouched(form, path)
    },
    change: (newValue: Get<T, P & string>) => form.set(path, newValue),
    blur: () => form.blur(path),
    focus: () => form.focus(path),
  }
}

// type MakeSelector = (path: string) => string
// const defaultSelector: MakeSelector = (path) => `#${path},[name="${path}"],[data-qa="${path}"],[data-testid="${path}"]`

// const useFormFieldFocusEvents = <T, P extends Paths<T>>(
//   form: Form<T>,
//   path: P,
//   makeSelector = defaultSelector,
// ) => {
//   useEffect(() => {
//     const selector = makeSelector(String(path))
//     const element = document.querySelector(selector)
//     if (!element) throw new Error(`failed to find element by path "${path}", selector: "${selector}"`)

//     const makeListener = (action: (path: Paths<T>) => void) => () => action(path)
//     const focusListener = makeListener(form.focus)
//     const blurListener = makeListener(form.blur)
//     element.addEventListener('focusin', focusListener)
//     element.addEventListener('focusout', blurListener)
//     return () => {
//       element.removeEventListener('focusin', focusListener)
//       element.removeEventListener('focusout', blurListener)
//     }
//   }, [form, path])
// }

function makeHook<U>(events: FormEvent[], getter: (form: Form<any>, path?: string) => U) {
  return (form: Form<any>, path?: string) => {
    const [state, setState] = useState(getter(form, path))

    useEffect(() => {
      const listener = () => setState(getter(form, path))
      const subscribers = events.map((event) => {
        return path ? form.on(event as any, path as never, listener) : form.on(event as any, listener)
      })
      return () => {
        subscribers.forEach((unsubscribe) => unsubscribe())
      }
    }, [form, path])

    return state
  }
}
