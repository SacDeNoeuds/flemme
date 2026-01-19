import { describe, expect, it } from 'vitest'
import { get } from '../utils'

const obj = {
  a: {
    1: 'test',
  },
  2: {
    array: ['A', 'B', 'C'],
  },
  3: 'Jack',
  name: 'Toto',
}

describe(get.name, () => {
  it('returns top-level string property', () => {
    expect(get(obj, 'name')).toBe('Toto')
    expect(get(obj, 'a')).toEqual({
      1: 'test',
    })
  })

  it('returns top-level number property', () => {
    expect(get(obj, '3')).toBe('Jack')
  })

  it('returns nested number property', () => {
    expect(get(obj, 'a.1')).toBe('test')
  })

  it('returns a nested number property', () => {
    expect(get(obj, 'a.1')).toBe('test')
  })

  it('returns an existing nested array property', () => {
    expect(get(obj, '2.array.2')).toBe('C')
  })

  it('returns `undefined` for a inexistent nested array property', () => {
    expect(get(obj, '2.array.4')).toBe(undefined)
  })

  it('returns a nested property when the source is an array', () => {
    expect(get([{ name: 'a' }, { name: 'b' }], '0.name')).toBe('a')
  })
})
