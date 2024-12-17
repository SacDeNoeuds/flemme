import isEqual from 'fast-deep-equal'
import { makeLib } from 'flemme'
import get from 'just-safe-get'
import set from 'just-safe-set'
import cloneDeep from 'object-deep-copy'

export const makeForm = makeLib({ get, set, isEqual, cloneDeep })
