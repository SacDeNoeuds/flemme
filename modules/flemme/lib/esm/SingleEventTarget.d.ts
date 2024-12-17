type Unsubscribe = () => void
type Listener<T> = (value: T) => unknown
export declare function SingleEventTarget<T>(): {
  dispatch: (value: T) => void
  subscribe: (listener: Listener<T>) => Unsubscribe
  clear: () => void
}
export {}
