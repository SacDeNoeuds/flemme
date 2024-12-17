import type { PartialDeep } from 'type-fest'
type IterableValue<T> = T extends Iterable<infer Value> ? Value : never
export declare const applyWhen: <T extends Iterable<any>>(
  iterable: T,
  predicate: (value: IterableValue<T>) => boolean,
  apply: (value: IterableValue<T>) => void,
) => void
export declare const removeBy: <T>(set: Set<T>, predicate: (value: T) => boolean) => void
export declare const some: <T>(iterable: Iterable<T>, predicate: (value: T) => boolean) => boolean
export declare const addItem: <T>(
  value?: PartialDeep<T>[] | undefined,
  item?: PartialDeep<T> | undefined,
  atIndex?: number,
) => Array<PartialDeep<T> | undefined>
export declare const removeItem: <T>(
  value: PartialDeep<T>[] | undefined,
  atIndex: number,
) => PartialDeep<T>[] | undefined
export {}
