import { Validate } from '../lib/validation'

export const mustNotContain = (forbidden: string): Validate<string> => {
  return (value) => {
    return value?.includes(forbidden) ? [{ type: mustNotContain.type, value, forbidden }] : []
  }
}
mustNotContain.type = 'mustNotContain'
