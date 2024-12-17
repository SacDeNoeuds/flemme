/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { FormEvent, Form } from 'flemme'
import type { Form, FormEvent } from 'flemme'
import { useEffect, useState } from 'react'
import type { Get, Paths } from 'type-fest'

function makeHook<U>(events: FormEvent[], getter: (form: Form<any, any>, path?: string) => U) {
  return <T, P extends Paths<T>, Errs = any>(form: Form<T, Errs>, path?: P & string) => {
    const [state, setState] = useState(getter(form, path))

    useEffect(() => {
      const listener = () => setState(getter(form, path))
      const subscribers = events.map((event) => {
        return path ? form.on(event as any, path, listener) : form.on(event as any, listener)
      })
      return () => {
        subscribers.forEach((unsubscribe) => unsubscribe())
      }
    }, [form, path])

    return state
  }
}

export const useVisited = makeHook(['focus', 'reset', 'validated'], (form, path) => form.isVisited(path as never))
export const useDirty = makeHook(['change', 'reset'], (form, path) =>
  path ? form.isDirty : form.isDirtyAt(path as never),
)
export const useValue = makeHook(['change', 'reset'], (form, path) => form.get(path as never)) as <
  T,
  P extends Paths<T>,
>(
  form: Form<T>,
  path: P,
) => Get<T, P & string>
export const useInitial = makeHook(['change', 'reset'], (form, path) => form.getInitial(path as never)) as <
  T,
  P extends Paths<T>,
>(
  form: Form<T>,
  path: P,
) => Get<T, P & string>
