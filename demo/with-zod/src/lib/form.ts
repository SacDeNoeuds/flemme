/* eslint-disable @typescript-eslint/ban-ts-comment */
import { makeLib } from 'flemme'
// @ts-ignore no types for mout
import { get, set, deepClone } from 'mout/object'
// @ts-ignore no types for mout
import { deepEquals, deepClone } from 'mout/lang'

export const makeForm = makeLib({
  get: get,
  set: set,
  isEqual: deepEquals,
  cloneDeep: deepClone,
})
