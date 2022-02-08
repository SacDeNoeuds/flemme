# formacy

Hopefully − the cure to (complex) forms

Framework-agnostic form management

## Getting started

### Installation

```sh
npm i -D formacy
```

## Limitations

The top-level value _must_ be an object or an array

## Guides

### Simple login form

```ts
import { Form, form, object, string, InferValue } from 'formacy'

type LoginFormValue = {
  login: string
  password: string
}
const makeLoginForm = form<LoginFormValue>({
  schema: object({
    login: string(),
    password: string(),
  }),
})
// Although it's recommended to declare your type first, you can also infer the form value
type InferredLoginFormValue = InferValue<typeof makeLoginForm>

const submitLoginForm = async (loginForm: Form<LoginFormValue>) => {
  loginForm.validate()
  if (!loginForm.valid) return
  const result = await fetch('/login', {
    body: {
      username: loginForm.fields.login.value,
      password: loginForm.field.password.value,
    },
  })
}

const main = async () => {
  const loginForm = makeLoginForm({
    login: undefined,
    password: undefined,
  })

  // simulated users interactions:
  loginForm.fields.login.focus()
  loginForm.fields.login.change('Batman')
  loginForm.fields.login.blur()

  // simulated 'password' change
  loginForm.fields.password.focus()
  loginForm.fields.password.change('I <3 Robin')
  loginForm.fields.password.blur()

  await submitLoginForm(loginForm)
}
```

### Custom validation

```ts
import { Form, form, object, string, makeValidator } from 'formacy'
import isEmail from 'is-email'

const mustBeEmail = () =>
  makeValidator(
    isEmail, // predicate, return true for a valid value
    (value) => ({ type: 'mustBeEmail', value }), // validation error, only 'type' is required
  )

const makeLoginForm = form<LoginFormValue>({
  schema: object({
    login: string(mustBeEmail()),
    password: string(),
  }),
})

const main = () => {
  const loginForm = makeLoginForm({ login: 'not-an-email', password: '******' })
  loginForm.validate()
  // field-level errors
  loginForm.fields.login.errors // [{ type: 'mustBeEmail', value: 'not-an-email' }]

  // form-level errors
  loginForm.errors // [{ field: loginForm.fields.login, type: 'mustBeEmail', value: 'not-an-email' }]
}
```

### All fields − user form

```ts
import { Form, form, array, object, string, number, boolean, optional, nullable, date, literal, makeValidator } from 'formacy'

type UserFormValue = {
  gender: 'male' | 'female' | 'other'
  name: string
  birthDate: Date | undefined // WARNING: use "prop: MyType | undefined" and not "prop?: MyType"
  hobbies: Array<{ name: string; hoursPerWeek: number }> | null
}
const makeUserForm = form<UserFormValue>({
  schema: object({
    gender: literal(['male', 'female', 'other']),
    name: string(),
    birthDate: optional(date()),
    hobbies: nullable(
      array(
        object({
          name: string(),
          hoursPerWeek: number(mustBePositive()),
        }),
      ),
    ),
  }),
})

// custom validators:
const isGreaterThan = (min: number) => (n) => n >= min
const greaterThan = (min: number, type = 'greaterThan') =>
  makeValidator(
    isGreaterThan(min), // predicate, return true for a valid value
    (value) => ({ type, value, min }), // validation error, only "type" is required
  )
const positive = () => greaterThan(0, 'positive')
```

### Add form/fields listeners

```ts

```

### Interdependant fields values − shipping form → skip if shipping address when same as billing

```ts

```

### Interdependant fields validation − password match

```ts

```

### Async validation

```ts

```

### Sync & Async validation

```ts

```

## API

### Form

Form
form

### Fields

#### `BaseField<Value>` (type)

```ts
interface BaseField<Value> {
  readonly initial: Value | undefined | null
  readonly value: Value | undefined | null // When field is required, cannot be undefined or null when valid is `true`
  /** true` when a change − even to same value − has been made. Object and array reflect that value as well */
  readonly touched: boolean
  /** `true` when the field has gained focus, never changes to false until a reset */
  readonly visited: boolean
  /**
   * For primitive fields, `true` when the field has gained focus then `false` when losing it.
   * For object and array fields, `true` if some of their inner fields visited value is `true`, `false` otherwise
   */
  readonly active: boolean
  readonly pristine: boolean // `true` when value is same as initial, no matter how many changes
  readonly dirty: boolean // opposite of pristine
  readonly errors: ValidationError[] // type ValidationError = { type: string, ...otherMeta: Record<string, any> }
  readonly valid: boolean // only when errors.length === 0

  readonly name: string // lodash-like path, ie: object({ cities: array(string()) }) → cities[0] name is 'cities.0'

  reset(nextInitial?: Value | undefined | null): void
  validate(): void
  on(eventName: 'reset' | 'change' | 'focus' | 'blur', listener: () => void): Unlisten /* type Unlisten = () => void */
  change(value: Value | undefined | null): void
}
```

#### `primitive<T>()`

```ts
function primitive<T extends Primitive>(...validators: Array<Validator<T>>): /* … internal mechanism then … */ PrimitiveField<T>

type Primitive = string | number | boolean | Date
type Validator<T> = (value: T | undefined | null) => ValidationError[]

interface PrimitiveField<T> extends BaseField<T> {
  focus: () => void
  blur: () => void
}
```

#### `string()`

```ts
import { mustBeString } from 'path/to/internal-validators'
export const string = (...validators: Validator<string>[]) => primitive<string>(mustBeString(), ...validators)
```

#### `number()`

```ts
import { mustBeNumber } from 'path/to/internal-validators'
export const number = (...validators: Validator<number>[]) => primitive<number>(mustBeNumber(), ...validators)
```

#### `date()`

```ts
import { mustBeDate } from 'path/to/internal-validators'
export const date = (...validators: Validator<Date>[]) => primitive<Date>(mustBeDate(), ...validators)
```

#### `boolean()`

```ts
import { mustBeBoolean } from 'path/to/internal-validators'
export const boolean = (...validators: Validator<boolean>[]) => primitive(mustBeBoolean(), ...validators)
```

#### `oneOf()`

```ts
import { mustBeOneOf } from 'path/to/internal-validators'
export const oneOf = <Value extends Primitive>(literals: Value[], ...validators: Validator<Value>[]) => {
  return primitive<Value>(mustBeOneOf(literals), ...validators)
}
```

#### `optional()`

```ts
// Types are simplified/vulgarized
type Field<T> = PrimitiveField<T> | ObjectField<T> | ArrayField<T>
const optional = <T>(field: BaseField<T>): BaseField<T | undefined> => {…}

// Usage
const demo = object({
  // works on primitives
  name: optional(string()),

  // works on arrays
  hobbies: optional(array(string())),

  // works on objects
  address: optional(object({ street: string(), /* … */ })),
})
```

#### `nullable()`

```ts
// Types are simplified/vulgarized
type Field<T> = PrimitiveField<T> | ObjectField<T> | ArrayField<T>
const nullable = <T>(field: Field<T>): Field<T | null> => {…}

// Usage
const demo = object({
  // works on primitives
  name: nullable(string()),

  // works on arrays
  hobbies: nullable(array(string())),

  // works on objects
  address: nullable(object({ street: string(), /* … */ })),
})
```

#### `object()`

```ts
const object = <T>(
  fields: { [Key in keyof T]: Field<T[Key]> }, /* basically: a field for each key */
  options: {
    validators?: Validator<T>[], // Array<(value: T) => ValidationError[]>
    validateAsync?: (value: T) => Promise<ValidationError[]>
    /**
     * `onInit` is triggered when fields are created, which might happen multiple times for optional/nullable object fields
     * It allows to register event listeners for instance
     */
    onInit?: (field: ObjectField<T>) => void
  },
): /* …internal mechanism then … */ ObjectField<T> => {…}

interface ObjectField<T> extends BaseField<T> {
  readonly fields:
    | undefined /* when value is undefined */
    | null /* when value is null */
    | { [Key in keyof T]: Field<T[Key]> }, /* basically: a field for each key */
  readonly validated: Promise<void> // useful only when `validateAsync` is provided
}
```

#### `merge()`

```ts
// Types are simplified/vulgarized
type AnyObject = Record<string, any>
const merge = <A extends AnyObject, B extends AnyObject, C extends AnyObject /*, … */>(a, b, c /*, … */): ObjectField<A & B & C /* & … */> => {…}

// Usage
const fieldOne = object({ name: string() })
const fieldTwo = object({ birthDate: date() })
const field = merge(fieldOne, fieldTwo) // ObjectField<{ name: string } & { birthDate: Date }>
```

#### `array()`

```ts
const array = <T extends any[]>(
  field: Field<T[number]>, /* basically: a field matching the array item value */
  options: {
    validators?: Validator<T>[], // Array<(value: T) => ValidationError[]>
    validateAsync?: (value: T) => Promise<ValidationError[]>
    /**
     * `onInit` is triggered when fields are created, which might happen multiple times for optional/nullable object fields
     * It allows to register event listeners for instance
     */
    onInit?: (field: ArrayField<T>) => void
  },
): /* …internal mechanism then … */ ArrayField<T> => {…}

interface ArrayField<Value extends any[]> extends BaseField<Value> {
  fields:
    | undefined /* when value is undefined */
    | null /* when value is null */
    | Field<Value[number]>[] /* basically: a field for each array item */
  validated: Promise<void> // useful only when `validateAsync` is provided

  add(item: Value[number], index?: number): void
  remove(index: number): void
  move(index: number, targetIndex: number): void
}
```

### Validation

### `ValidationError` (type)

```ts
interface ValidationError {
  type: string
  [Key: string]: any // any data you want, only 'type' is required
}
```

### `errorType` − built-in error types

```ts
const errorType = {
  mustBeNotNil: 'mustBeNotNil',
  mustBeString: 'mustBeString',
  mustHaveMinLength: 'mustHaveMinLength',
  mustHaveMaxLength: 'mustHaveMaxLength',
  mustBeOneOf: 'mustBeOneOf',
  mustBeNumber: 'mustBeNumber',
  mustBeDate: 'mustBeDate',
  mustBeBoolean: 'mustBeBoolean',
}
```

### `makeValidator()`

```ts
import { makeValidator } from 'formacy'
import isEmail from 'is-email'

export const mustBeEmail = () =>
  makeValidator(
    isEmail, // predicate, return true for a valid value
    (value) => ({ type: 'mustBeEmail', value }), // validation error, only 'type' is required
  )

// To avoid typo issues, you should probably make the error type a constant:
export const mustBeEmailErrorType = 'mustBeEmail'
// or
mustBeEmail.type = 'mustBeEmail'
```

### `mustHaveMinLength()`

```ts
import { mustHaveMinLength, form, array, string, number } from 'formacy'

const makeForm = form({
  schema: object({
    demo: array(number(), { validators: [mustHaveMinLength(5)] })
    name: string(mustHaveMinLength(3)),
  }),
})
const myForm = makeForm({ demo: [1, 2, 3], name: 'Jake' })
myForm.validate()
myForm.errors[0]
// { type: 'mustHaveMinLength', value: [1, 2, 3], min: 5 }
myForm.errors[1]
// { type: 'mustHaveMinLength', value: 'Jake', min: 5 }
```

### `mustHaveMaxLength()`

```ts
import { mustHaveMaxLength, form, array, string, number } from 'formacy'

const makeForm = form({
  schema: object({
    demo: array(number(), { validators: [mustHaveMaxLength(3)] })
    name: string(mustHaveMaxLength(3)),
  }),
})
const myForm = makeForm({ demo: [1, 2, 3, 4], name: 'Cesare' })
myForm.validate()
myForm.errors[0]
// { type: 'mustHaveMaxLength', value: [1, 2, 3, 4], max: 3 }
myForm.errors[1]
// { type: 'mustHaveMaxLength', value: 'Cesare', max: 3 }
```
