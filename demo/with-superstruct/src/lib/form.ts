/* eslint-disable @typescript-eslint/ban-ts-comment */
import { makeLib } from 'flemme'
import isEqual from 'fast-deep-equal' // 852B minified
// @ts-ignore missing @types/_
import cloneDeep from 'object-deep-copy' // 546B minified
import get from '@strikeentco/get' // 450B minified
// @ts-ignore missing @types/_
import set from '@strikeentco/set' // 574B minified

export const makeForm = makeLib({ get, set, isEqual, cloneDeep })
