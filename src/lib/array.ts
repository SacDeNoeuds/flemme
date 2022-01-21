/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const hasIndex = (array: any[], index: number): boolean => index > 0 && index < array.length
export const swap = <T>(array: T[]) => {
  return (i: number, j: number): T[] => {
    if (!hasIndex(array, i) || !hasIndex(array, j)) throw new Error('invalid indices')
    const copy = [...array]
    ;[copy[i], copy[j]] = [array[j], array[i]]
    return copy
  }
}
