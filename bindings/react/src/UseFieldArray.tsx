/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type ReactNode } from 'react'
import { type Form } from 'flemme'
import { UseField, Watchable, type FieldState } from './UseField'

type Props<FormValue, Path extends string> = {
  form: Form<FormValue>
  path: Path
  watch?: Watchable[]
  // prettier-ignore
  children: (state: FieldState<FormValue, Path> & {
    add: (value?: any, index?: number) => void
    remove: (index: number) => void
  }) => ReactNode
}
export const UseFieldArray = <T, P extends string>({ form, path, children }: Props<T, P>): JSX.Element => {
  const makeAdd = (value: any[]) => {
    return (item?: any, index = value?.length ?? 0) => {
      if (!value) value = []
      value.splice(index, 0, item)
      form.change(path, value as any)
    }
  }
  const makeRemove = (value: any[]) => {
    return (index: number) => {
      if (!value) value = []
      value.splice(index, 1)
      form.change(path, value as any)
    }
  }
  return (
    <UseField form={form} path={path}>
      {(state) => {
        return children({
          ...state,
          add: makeAdd(state.value as any[]),
          remove: makeRemove(state.value as any[]),
        })
      }}
    </UseField>
  )
}
