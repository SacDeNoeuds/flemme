import { describe, expect, it } from 'vitest'
import { clone } from '../utils'

class Foo {
  constructor(public x: number) {
    if (typeof x !== 'number') throw new Error('not a number')
  }
}

describe(clone.name, () => {
  it('should return primitives unchanged', () => {
    const num = 42
    const str = 'hello'
    expect(clone(num)).toBe(num)
    expect(clone(str)).toBe(str)
  })

  it('should deep clone arrays', () => {
    const a = [1, { b: 2 }]
    const b = clone(a)
    expect(b).not.toBe(a)
    expect(b).toEqual(a)
  })

  it('should deep clone plain objects', () => {
    const o = { a: 1, nested: { c: 3 } }
    const p = clone(o)
    expect(p).not.toBe(o)
    expect(p).toEqual(o)
  })

  it('should clone Date instances', () => {
    const d1 = new Date(2025, 0, 1)
    const d2 = clone(d1)
    expect(d2).not.toBe(d1)
    expect(d2.getTime()).toBe(d1.getTime())
  })

  it('should clone Set instances via constructor', () => {
    const s1 = new Set([1, 2])
    const s2 = clone(s1)
    expect(s2).not.toBe(s1)
    expect([...s2]).toEqual([1, 2])
  })

  it('should return functions unchanged', () => {
    const fn = () => {}
    expect(clone(fn)).toBe(fn)
  })

  it('should return symbols unchanged', () => {
    const sym = Symbol('s')
    expect(clone(sym)).toBe(sym)
  })

  it('should return non-cloneable class instances unchanged', () => {
    const f = new Foo(5)
    expect(clone(f)).toBe(f)
  })
})
