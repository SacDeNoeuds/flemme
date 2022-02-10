/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { FormEvent, Form } from 'flemme'
import type { Form, FormEvent } from 'flemme'
import type { PartialDeep, Get } from 'type-fest'
import { useEffect, useState } from 'react'

type Method = Extract<keyof Form<any>, 'isDirty' | 'isActive' | 'isVisited' | 'isModified' | 'isValid' | 'errors' | 'value' | 'initial'>
const makeHook = <M extends Method>(method: M, events: FormEvent[]) => {
  return <T, E, P extends string>(form: Form<T, E>, path?: P): ReturnType<Form<T, E>[M]> => {
    const operation = (form as any)[method] as (path?: P) => ReturnType<Form<T>[M]>
    const [state, setState] = useState<ReturnType<Form<T>[M]>>(operation(path))

    useEffect(() => {
      const listener = () => setState(operation(path))
      events.forEach((event) => (path ? form.on(path, event, listener) : form.on(event, listener)))
      return () => events.forEach((event) => form.off(event, listener))
    }, [path, operation, form])

    return state
  }
}

export const useModified = makeHook('isModified', ['change', 'reset', 'validated'])
export const useVisited = makeHook('isVisited', ['focus', 'reset', 'validated'])
export const useActive = makeHook('isActive', ['focus', 'blur', 'reset'])
export const useDirty = makeHook('isDirty', ['change', 'reset'])
export const useErrors = makeHook('errors', ['validated']) as <ValidationErrors>(form: Form<any, ValidationErrors>) => ValidationErrors
export const useValid = makeHook('isValid', ['validated'])
export const useValue = makeHook('value', ['change', 'reset']) as <T, P extends string>(form: Form<T>, path?: P) => PartialDeep<Get<T, P>>
export const useInitial = makeHook('initial', ['change', 'reset']) as <T, P extends string>(form: Form<T>, path?: P) => PartialDeep<Get<T, P>>
