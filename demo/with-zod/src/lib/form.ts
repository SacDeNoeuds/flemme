import { makeLib } from 'flemme'
import { get, set, isEqual, cloneDeep } from 'lodash-es'

export const makeForm = makeLib({ get, set, isEqual, cloneDeep })
