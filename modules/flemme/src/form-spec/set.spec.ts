import { describe, expect, it } from 'vitest'
import { set } from '../utils'

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

describe(set.name, () => {
  it('sets top-level string property', () => {
    const obj = { name: { first: 'Jack' }, 1: 'One' }
    set(obj, 'name', { first: 'Toto' })
    expect(obj).toEqual({
      name: { first: 'Toto' },
      1: 'One',
    })
  })

  it('sets top-level number property', () => {
    const obj = { name: 'Jack', 1: 'One' }
    set(obj, '1', 'One-ish')
    expect(obj).toEqual({
      name: 'Jack',
      1: 'One-ish',
    })
  })

  it('sets nested number property', () => {
    const obj = { name: 'Jack', a: { 1: 'test' } }
    set(obj, 'a.1', 'Toto')
    expect(obj).toEqual({
      name: 'Jack',
      a: { 1: 'Toto' },
    })
  })

  it('sets an existing nested array property', () => {
    const obj = { 2: { array: ['A', 'B', 'c'] } }
    set(obj, '2.array.2', 'C')
    expect(obj).toEqual({ 2: { array: ['A', 'B', 'C'] } })
  })

  it('sets the value of an inexistent nested array index', () => {
    const obj = { array: ['A'] }
    set(obj, 'array.4', 'E')
    expect(obj.array).toHaveLength(5)
    const expected = ['A']
    expected[4] = 'E'
    expect(obj).toEqual({ array: expected })
  })

  it('sets a nested property when the source is an array', () => {
    const array = [{ name: 'A' }, { name: 'b' }]
    set(array, '0.name', 'a')
    expect(array).toEqual([{ name: 'a' }, { name: 'b' }])
  })
})
