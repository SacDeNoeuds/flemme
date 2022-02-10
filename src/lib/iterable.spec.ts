import { add, remove } from './iterable'

describe('add', () => {
  const demo = [1, 2, 3, 4]
  it('should append 5 to undefined', () => expect(add(undefined, 5)).toEqual([5]))
  it('should append 5', () => expect(add(demo, 5)).toEqual([1, 2, 3, 4, 5]))
  it('should prepend 5', () => expect(add(demo, 5, 0)).toEqual([5, 1, 2, 3, 4]))
  it('should add 5 at 2nd position', () => expect(add(demo, 5, 1)).toEqual([1, 5, 2, 3, 4]))
  it('should append 5 when atIndex is too big', () => expect(add(demo, 5, 100)).toEqual([1, 2, 3, 4, 5]))
  it('should add 5 at 2nd position from the end', () => expect(add(demo, 5, -1)).toEqual([1, 2, 3, 5, 4]))
})

describe('remove', () => {
  const demo = [1, 2, 3, 4]
  it('should remove first element', () => expect(remove(demo, 0)).toEqual([2, 3, 4]))
  it('should remove 2nd element', () => expect(remove(demo, 1)).toEqual([1, 3, 4]))
  it('should remove last element', () => expect(remove(demo, 3)).toEqual([1, 2, 3]))
  it('should not remove anything when array is undefined', () => expect(remove(undefined, 2)).toEqual(undefined))
  it('should not remove element when index is too high', () => expect(remove(demo, 12)).toEqual([1, 2, 3, 4]))
  it('should not remove element when index is negative', () => expect(remove(demo, -12)).toEqual([1, 2, 3, 4]))
})
