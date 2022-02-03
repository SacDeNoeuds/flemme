// import { ReactNode, useEffect, useState } from 'react'
// import { Get, PartialDeep } from 'type-fest'
// import { Form, FormEvent, PathShape } from './main'

// type Method = Extract<keyof Form<any>, 'isDirty' | 'isActive' | 'isVisited' | 'isModified' | 'errors'>
// const makeHook = <M extends Method>(method: M, events: FormEvent[]) => <T, E, P extends string>(form: Form<T, E, P>, path?: P): ReturnType<Form<T, E>[M]> => {
//   const operation = (form as any)[method] as (path?: P) => ReturnType<Form<T>[M]>
//   const [state, setState] = useState<ReturnType<Form<T>[M]>>(operation(path))

//   useEffect(() => {
//     const listener = () => setState(operation(path))
//     events.forEach((event) => path ? form.on(path, event, listener) : form.on(event, listener))
//     return () => events.forEach((event) => form.off(event, listener))
//   }, [path, operation, form])

//   return state
// }

// const valueEvents: FormEvent[] = ['change', 'reset']
// export const useValue = <T, P extends string>(form: Form<T>, path: P): PartialDeep<Get<T, P>> => {
//   const [state, setState] = useState<PartialDeep<Get<T, P>>>(form.value(path))

//   useEffect(() => {
//     const listener = () => setState(form.value(path))
//     valueEvents.forEach((event) => form.on(path, event, listener))
//     return () => valueEvents.forEach((event) => form.off(event, listener))
//   }, [path, form])

//   return state
// }
// export const useInitial = <T, P extends string>(form: Form<T>, path: P): PartialDeep<Get<T, P>> => {
//   const [state, setState] = useState<PartialDeep<Get<T, P>>>(form.initial(path))

//   useEffect(() => {
//     const listener = () => setState(form.initial(path))
//     valueEvents.forEach((event) => form.on(path, event, listener))
//     return () => valueEvents.forEach((event) => form.off(event, listener))
//   }, [path, form])

//   return state
// }

// export const useModified = makeHook('isModified', ['change', 'reset', 'validated'])
// export const useVisited = makeHook('isVisited', ['focus', 'reset', 'validated'])
// export const useActive = makeHook('isActive', ['focus', 'blur', 'reset'])
// export const useDirty = makeHook('isDirty', ['change', 'reset'])
// export const useErrors = makeHook('errors', ['validated'])

// // type Watchable = 'initial' | 'value' | 'isDirty' | 'isModified' | 'isVisited' | 'isActive'
// type CompositeFieldProps<T, P extends PathShape> = {
//   form: Form<T>,
//   path: P,
//   children: (
//     value: PartialDeep<Get<T, P>>,
//     mutators: {
//       add: (value?: any, index?: number) => void,
//       remove: (index: number) => void,
//     },
//   ) => ReactNode,
// }
// export const CompositeField = <T, P extends PathShape>({ form, path, children }: CompositeFieldProps<T, P>): JSX.Element | null => {
//   const value = useValue(form, path) as any // object or array
//   const add = (item?: any, index = value.length) => {
//     value.splice(index, 0, item)
//     form.change(path, value)
//   }
//   const remove = (index: number) => {
//     value.splice(index, 1)
//     form.change(path, value)
//   }
//   return <>{children(value, { add, remove })}</>
// }

// // export const useValidation = <T, ValidationErrors extends any>(
// //   form: Form<T, ValidationErrors>,
// //   validate: (value: T | undefined) => ValidationErrors | undefined,
// //   validateOn: FormEvent[] = ['blur'],
// // ): ValidationErrors => {
// //   const [errors, setErrors] = useState<ValidationErrors>([])

// //   useEffect(() => {
// //     const listener = () => setErrors(validate(form.value()) ?? [])
// //     const events = new Set(validateOn)
// //     events.forEach((event) => form.on(event, listener))
// //     return () => {
// //       events.forEach((event) => form.off(event, listener))
// //     }
// //   }, [form, validate]) // eslint-disable-line

// //   return errors
// // }
