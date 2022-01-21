// import { ReactNode, useEffect, useState } from 'react'
// import { BaseField } from './main'

// // React bindings
// type Trigger = Parameters<BaseField<any>['on']>[0]

// const makeFieldStateHook = <Key extends keyof BaseField<any>>(key: Key, triggers: Trigger[]) => {
//   const useFieldState = <T extends BaseField<any>>(field: T): T[Key] => {
//     const [state, setState] = useState(field[key])
//     useEffect(() => {
//       const unlistenFns = triggers.map((trigger) => field.on(trigger, () => setState(field[key])))
//       return () => unlistenFns.forEach((unlisten) => unlisten)
//     }, [field])
//     return state
//   }
//   return useFieldState
// }

// export const useValue = makeFieldStateHook('value', ['change'])
// export const useErrors = makeFieldStateHook('errors', ['change', 'focus', 'blur']) // since the dev defines when to trigger validation, listen to all events
// export const useValid = makeFieldStateHook('valid', ['change', 'focus', 'blur']) // since the dev defines when to trigger validation, listen to all events
// export const useDirty = makeFieldStateHook('dirty', ['change'])
// export const usePristine = makeFieldStateHook('pristine', ['change'])
// export const useTouched = makeFieldStateHook('touched', ['change'])
// export const useVisited = makeFieldStateHook('visited', ['focus', 'blur'])

// type WhenProps<Value extends any> = {
//   is: Value
//   isEqual?: (a: Value, b: Value) => boolean
//   field: BaseField<Value>
//   children: ReactNode,
// }
// export const When = <Value extends any>({
//   field,
//   is,
//   isEqual = (a, b) => a === b,
//   children,
// }: WhenProps<Value>): JSX.Element | null => {
//   const value = useValue(field)
//   return isEqual(value, is) ? <>{children}</> : null
// }
