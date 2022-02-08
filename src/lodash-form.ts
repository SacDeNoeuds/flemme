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
export const userForm = makeForm<User>({ initial: {} })
export const usersForm = makeForm<User[]>({ initial: [] })

userForm.on('change', () => console.log('form changed'))
userForm.on('meta.eye', 'change', () => console.log('meta.eye changed'))
userForm.change('meta.eye', [{ color: 'blue' }])
console.log(userForm.isDirty('meta.eye'))
