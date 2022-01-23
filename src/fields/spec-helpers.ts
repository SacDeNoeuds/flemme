import { Validate } from '../lib/validation'

export const forbidString = (needle: string): Validate<string> => {
  return (hay) => {
    return hay?.includes(needle) ? [{ message: `Cannot contain "${needle}"` }] : []
  }
}
