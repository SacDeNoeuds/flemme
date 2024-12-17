import { describe, expect, it, vi } from 'vitest'
import { addItem, applyWhen, removeItem, some } from './iterable'

describe('applyWhen', () => {
  const demo = [1, 2, 3, 4]

  it('applies fn when n = 3 only', () => {
    const fn = vi.fn()
    applyWhen(demo, (n) => n === 3, fn)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('never applies fn when n = 5', () => {
    const fn = vi.fn()
    applyWhen(demo, (n) => n === 5, fn)
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('some', () => {
  const demo = [1, 2, 3, 4]
  it('has 3', () => {
    expect(some(demo, (n) => n === 3)).toBe(true)
  })
  it('has not 5', () => {
    expect(some(demo, (n) => n === 5)).toBe(false)
    expect(some([], (n) => n === 5)).toBe(false)
  })
})

describe('add', () => {
  const demo = [1, 2, 3, 4]
  it('should append 5 to []', () => expect(addItem([], 5)).toEqual([5]))
  it('should append 5', () => expect(addItem(demo, 5)).toEqual([1, 2, 3, 4, 5]))
  it('should prepend 5', () => expect(addItem(demo, 5, 0)).toEqual([5, 1, 2, 3, 4]))
  it('should add 5 at 2nd position', () => expect(addItem(demo, 5, 1)).toEqual([1, 5, 2, 3, 4]))
  it('should append 5 when atIndex is too big', () => expect(addItem(demo, 5, 100)).toEqual([1, 2, 3, 4, 5]))
  it('should add 5 at 2nd position from the end', () => expect(addItem(demo, 5, -1)).toEqual([1, 2, 3, 5, 4]))
})

describe('remove', () => {
  const demo = [1, 2, 3, 4]
  it('should remove first element', () => expect(removeItem(demo, 0)).toEqual([2, 3, 4]))
  it('should remove 2nd element', () => expect(removeItem(demo, 1)).toEqual([1, 3, 4]))
  it('should remove last element', () => expect(removeItem(demo, 3)).toEqual([1, 2, 3]))
  it('should not remove anything when array is empty', () => expect(removeItem([], 2)).toEqual([]))
  it('should not remove element when index is too high', () => expect(removeItem(demo, 12)).toEqual([1, 2, 3, 4]))
  it('should not remove element when index is negative', () => expect(removeItem(demo, -12)).toEqual([1, 2, 3, 4]))
})
