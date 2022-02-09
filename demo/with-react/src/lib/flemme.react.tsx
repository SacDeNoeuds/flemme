/* eslint-disable security/detect-object-injection */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
// React bindings for flemme
import { ReactNode, useEffect, useState } from 'react'
import { type Get, type PartialDeep } from 'type-fest'
import { type Form, type FormEvent } from 'flemme'

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
export const useErrors = makeHook('errors', ['validated'])
export const useValid = makeHook('isValid', ['validated'])
export const useValue = makeHook('value', ['change', 'reset']) as <T, P extends string>(form: Form<T>, path: P) => PartialDeep<Get<T, P>>
export const useInitial = makeHook('initial', ['change', 'reset']) as <T, P extends string>(form: Form<T>, path: P) => PartialDeep<Get<T, P>>

// type Watchable = 'initial' | 'value' | 'isDirty' | 'isModified' | 'isVisited' | 'isActive'
type FieldArrayProps<T, P extends string> = {
  form: Form<T>
  path: P
  children: (params: { value: PartialDeep<Get<T, P>>; add: (value?: any, index?: number) => void; remove: (index: number) => void }) => ReactNode
}
export const FieldArray = <T, P extends string>({ form, path, children }: FieldArrayProps<T, P>): JSX.Element | null => {
  const value = useValue(form, path) as any // object or array
  const add = (item?: any, index = value.length) => {
    value.splice(index, 0, item)
    form.change(path, value)
  }
  const remove = (index: number) => {
    value.splice(index, 1)
    form.change(path, value)
  }
  return <>{children({ value, add, remove })}</>
}
