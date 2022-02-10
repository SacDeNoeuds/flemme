/* eslint-disable @typescript-eslint/ban-ts-comment */
import { makeLib } from 'flemme'
import isEqual from 'fast-deep-equal' // 852B minified
// @ts-ignore missing @types/_
import cloneDeep from 'object-deep-copy' // 546B minified
import get from 'get-value' // 1.2kB minified
import set from 'set-value' // 1.5kB minified

export const makeForm = makeLib({ get, set, isEqual, cloneDeep })
