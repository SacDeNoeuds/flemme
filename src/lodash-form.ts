import type { O } from 'ts-toolbelt'
import { get, set, isEqual, cloneDeep } from 'lodash'
import { makeLib } from './main'

export const makeForm = makeLib({ get, set, isEqual, cloneDeep })

export type EyeColor = 'blue' | 'grey' | 'maroon' | 'green'
export type HairColor = 'blond' | 'brown' | 'dark' | 'white' | 'grey'
export type User = {
  name: string
  birthDate: Date
  meta: {
    eye: Array<{ color: EyeColor; ratio: number }>
    hair: Array<{ color: HairColor; ratio: number }>
  }
}
export type UserPaths = O.Paths<User>
// export type Test = O.Path<User, ['meta', 'eye', 1, '']>
// const userPath: UserPaths = ['meta', 'eye', 1, 'color']
export const userForm = makeForm<User>({})

// userForm.on('change', () => {})
// userForm.on('meta.eye', 'change', () => {})
// userForm.change('meta.eye', [{ color: 'blue' }])
// userForm.isDirty('meta.eye')
// userForm.on('change', () => {})
