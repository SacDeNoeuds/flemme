import { FormControl } from './FormControl'
export interface FormGroup<Controls extends Record<PropertyKey, FormControl<any, Errors>>, Errors> {
  controls: Controls
  isDirty(): boolean
  isModified(): boolean
  isVisited(): boolean
  getErrors(): Errors | undefined
}
