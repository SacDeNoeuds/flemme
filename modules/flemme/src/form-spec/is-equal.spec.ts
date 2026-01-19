import { describe, expect, it } from 'vitest'
import { isEqual } from '../utils'

describe(isEqual.name, () => {
  it('should compare primitives correctly', () => {
    expect(isEqual(1, 1)).toBe(true)
    expect(isEqual('foo', 'foo')).toBe(true)
    expect(isEqual(false, false)).toBe(true)
    expect(isEqual(1, 2)).toBe(false)
    expect(isEqual('a', 'b')).toBe(false)
  })

  it('should compare Date objects by value', () => {
    const d1 = new Date(2025, 0, 1)
    const d2 = new Date(2025, 0, 1)
    const d3 = new Date(2026, 0, 1)
    expect(isEqual(d1, d2)).toBe(true)
    expect(isEqual(d1, d3)).toBe(false)
  })

  it('should compare Blob instances by reference', () => {
    const b1 = new Blob(['a'])
    const b2 = new Blob(['a'])
    expect(isEqual(b1, b1)).toBe(true)
    expect(isEqual(b1, b2)).toBe(false)
  })

  it('should throw for functions', () => {
    expect(() =>
      isEqual(
        () => {},
        () => {},
      ),
    ).toThrow()
  })

  it('should throw for symbols', () => {
    expect(() => isEqual(Symbol(), Symbol())).toThrow()
  })

  it('should compare arrays recursively', () => {
    const a1 = [1, 2, { x: 'y' }]
    const a2 = [1, 2, { x: 'y' }]
    const a3 = [1, 2, { x: 'z' }]
    expect(isEqual(a1, a2)).toBe(true)
    expect(isEqual(a1, a3)).toBe(false)
  })

  it('should compare plain objects recursively', () => {
    const o1 = { a: 1, b: { c: 'd' } }
    const o2 = { a: 1, b: { c: 'd' } }
    const o3 = { a: 1, b: { c: 'e' } }
    expect(isEqual(o1, o2)).toBe(true)
    expect(isEqual(o1, o3)).toBe(false)
  })

  it('does not handle Set', () => {
    expect(isEqual(new Set(), new Set())).toBe(false)
  })
  it('does not handle Map', () => {
    expect(isEqual(new Map(), new Map())).toBe(false)
  })
})
