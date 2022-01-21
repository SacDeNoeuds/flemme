import { composeValidate } from './common'
import { forbidString } from './spec-helpers'

describe('composeValidate', () => {
  const validate = composeValidate(forbidString('Paris'), undefined, forbidString('Tokyo'))
  it('should return no error', () => {
    expect(validate('Some text')).toEqual([])
  })

  it('should return one error', () => {
    expect(validate('Go to Paris')).toEqual([{ message: 'Cannot contain "Paris"' }])
    expect(validate('Go to Tokyo')).toEqual([{ message: 'Cannot contain "Tokyo"' }])
  })

  it('should return first error in order of validators', () => {
    expect(validate('Go to Paris or Tokyo')).toEqual([{ message: 'Cannot contain "Paris"' }])
  })
})
