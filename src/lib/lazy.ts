/* eslint-disable @typescript-eslint/no-explicit-any */
type Fn = (...args: any[]) => any
type Lazy<F extends Fn> = F & {
  flush: () => void
}
const nothing = Symbol('nothing')
type Nothing = typeof nothing

export const lazy = <F extends Fn>(fn: F): Lazy<F> => {
  let result: ReturnType<F> | Nothing = nothing
  const flush = () => {
    result = nothing
  }

  const enhanced = ((...args) => {
    if (result === nothing) result = fn(...args)
    return result as ReturnType<F>
  }) as F

  return Object.assign(enhanced, { flush })
}
