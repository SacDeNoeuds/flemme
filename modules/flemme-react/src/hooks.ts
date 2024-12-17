/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { FormEvent, Form } from 'flemme'
import type { Form, FormEvent } from 'flemme'
import { useEffect, useState } from 'react'
import type { Get, PartialDeep, Paths } from 'type-fest'

type Method = Extract<
  keyof Form<any>,
  'isDirty' | 'isActive' | 'isVisited' | 'isModified' | 'isValid' | 'errors' | 'value' | 'initial'
>
const makeHook = <M extends Method>(method: M, events: FormEvent[]) => {
  return <T, E, P extends Paths<T>>(form: Form<T, E>, path?: P): ReturnType<Form<T, E>[M]> => {
    const operation = (form as any)[method] as (path?: P) => ReturnType<Form<T>[M]>
    const [state, setState] = useState<ReturnType<Form<T>[M]>>(operation(path))

    useEffect(() => {
      const listener = () => setState(operation(path))
      const subscribers = events.map((event) => (path ? form.on(path, event, listener) : form.on(event, listener)))
      return () => subscribers.forEach((unsubscribe) => unsubscribe())
    }, [path, operation, form])

    return state
  }
}

export const useVisited = makeHook('isVisited', ['focus', 'reset', 'validated'])
export const useActive = makeHook('isActive', ['focus', 'blur', 'reset'])
export const useDirty = makeHook('isDirty', ['change', 'reset'])
export const useErrors = makeHook('errors', ['validated']) as <ValidationErrors>(
  form: Form<any, ValidationErrors>,
) => ValidationErrors
export const useValid = makeHook('isValid', ['validated'])
export const useValue = makeHook('value', ['change', 'reset']) as <T, P extends string>(
  form: Form<T>,
  path?: P,
) => PartialDeep<Get<T, P>>
export const useInitial = makeHook('initial', ['change', 'reset']) as <T, P extends string>(
  form: Form<T>,
  path?: P,
) => PartialDeep<Get<T, P>>
