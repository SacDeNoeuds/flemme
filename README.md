# Flemme

Hopefully − the cure to (complex) forms

Framework-agnostic form management

---

Table of contents:

- [Getting started](#getting-started)
  - [Installation](#installation)
- [Basic usage](#basic-usage)
- [Limitations](#limitations)
- [Demos](#demos)
  - [Usage with superstruct − Simple login form](#usage-with-superstruct-−-simple-login-form)
- [API](#api)
  - [`makeLib({ get, set, isEqual, cloneDeep })`](#makelib-get-set-isequal-clonedeep-)
  - [`makeForm<T>({ initial, validate?, validationTriggers? })`](#makeformt-initial-validate-validationtriggers-)
  - [Form](#form)
    - [`form.initial(path?)`](#forminitialpath)
    - [`form.value(path?)`](#formvaluepath)
    - [`form.isDirty(path?)`](#formisdirtypath)
    - [`form.isModified(path?)`](#formismodifiedpath)
    - [`form.isVisited(path?)`](#formisvisitedpath)
    - [`form.isActive(path?)`](#formisactivepath)
    - [`form.change(formValue)` / `form.change(path, value)`](#formchangeformvalue--formchangepath-value)
    - [`form.reset(nextInitialValue?)`](#formresetnextinitialvalue)
    - [`form.resetAt(path, nextInitialValue?)`](#formresetatpath-nextinitialvalue)
    - [`form.blur(path)`](#formblurpath)
    - [`form.focus(path)`](#formfocuspath)
    - [`form.on(event, listener)` / `form.on(path, event, listener)`](#formonevent-listener--formonpath-event-listener)
    - [`form.off(event, listener)`](#formoffevent-listener)
    - [`form.validate()`](#formvalidate)
    - [`form.errors()`](#formerrors)
    - [`form.isValid()`](#formisvalid)
    - [`submit(handler)`](#submithandler)

## Installation

```sh
npm i -D flemme
```

:warning: For TS users: Enabling proper types requires TS v4.1+ and type-fest v0.21+

Then create a file to initialise the lib. Since I don’t want to enforce lib choices but I still need classic functions, you’ll have to inject into the lib:

```ts
// src/lib/flemme.(js|ts)
import { makeLib } from 'flemme'
import { get, set, isEqual, deepClone } from 'your-favorite-tool'

export const makeForm = makeLib({ get, set, isEqual, cloneDeep: deepClone })
```

<details>
<summary>With Lodash</summary>

```ts
// src/lib/flemme.ts
import { makeLib } from 'flemme'
import _ from 'lodash'

export const makeForm = makeLib({
  get: _.get,
  set: _.set,
  isEqual: _.isEqual,
  cloneDeep: _.isEqual,
})
```

</details>

<details>
<summary>With MoutJS</summary>

```ts
// src/lib/form.(ts|js)
import { makeLib } from 'flemme'
import mout from 'mout'

export const makeForm = makeLib({
  get: mout.get,
  set: mout.set,
  isEqual: mout.equals,
  cloneDeep: mout.deepClone,
})
```

</details>

<details>
  <summary>Underscore JS</summary>

```ts
import { makeLib } from 'flemme'
import _ from 'underscore'
import deepCloneMixin from 'underscore.deepclone'
import getSetMixin from 'underscore.getset'
_.mixin(deepCloneMixin)
_.mixin(getSetMixin)e

const makeForm = makeLib({
  get: _.get,
  set: _.set,
  isEqual: _.isEqual,
  cloneDeep: _.deepClone,
})
```

</details>

## Basic usage

```ts
// src/path/to/user-form.(js|ts)
import { makeForm } from 'path/to/lib/form'

export const makeUserProfileForm = (initialValue) => makeForm({
  initial: initialValue,
  validate: validateUserProfileForm,
  validationTriggers: ['change', 'blur', 'focus', 'reset', 'validated'], // all available triggers, pick only a subset of course (ideally one only)
})

const validateUserProfileForm = (value) => {
  const errors = [] // not necessarily an array, the data type of your choice ; who am I to tell you what data type best suits your need ?

  if (!value.name) errors.push({ code: 'name is required' })
  return errors.length === 0
    ? undefined // IMPORTANT: that's how the lib knows the form is valid
    : errors
}

const form = makeUserProfileForm({
  name: { first: 'John', last: 'Doe' },
  birthDate: new Date('1968-05-18'),
  tags: ['awesome guy', 'great dude'],
})

// mimic actual user actions
form.focus('name.first')
form.change('name.first', 'Fred')
form.blur('name.first')

form.focus('name.last')
form.change('name.last', 'Aster')
form.blur('name.last')

form.focus('tags.1')
form.change('tags.1', 'great dancer') // replaces "great dude" by "great dancer"
form.blur('tags.1')

// Handle array additions & deletion at array-level
// Avoid using form.change('tags.2', 'Kind hearted') to append a value
form.change('tags', [...form.value('tags'), 'Kind hearted'])

form.submit(async (values) => { await fetch('…', {}) })
  .then(() => {…})
  .catch(() => {…})
```

## Limitations

:warning: The top-level value _must_ be an object or an array

## Demos

- [With `superstruct` validation](/?go-to=_)
- [With `yup` validation](/?go-to=_)
- [With `zod` validation](/?go-to=_)
- [With React](/?go-to=_)

<!-- ### Usage with superstruct − Simple login form

```ts
import { Form, form, object, string, InferValue } from 'flemme'
import { object, string, Describe } from 'superstruct'

type LoginFormValue = {
  login: string
  password: string
}
const schema: Describe<LoginFormValues> = object({
  login: string(),
  password: string(),
})
const validateLoginForm = (value) => {
  const [errors] = schema.validate(value)
  if (!errors) return undefined
  return errors.failures().map((failure) => ({
    ...failure,
    // Adding your own error code is recommended.
    // Then in the UI you can display a proper error message based on the error code
    code: '…',
  }))
}

const makeLoginForm = (initialValue = { login: undefined, password: undefined }) => {
  return makeForm({ initial: initialValue, validate: validateLoginForm })
}

const mimicActualUserActions = async () => {
  // init page
  const form = makeLoginForm({
    login: undefined,
    password: undefined,
  })

  // user changes 'login'
  form.focus('login')
  form.change('login', 'Batman')
  form.blur('login')

  // user changes 'password'
  form.focus('password')
  form.change('password', 'I <3 Robin')
  form.blur('password')

  try {
    await form.submit(async ({ login, password }) => fetch('/login', {
      body: JSON.stringify({ name: login, pwd: password }),
    }))
  } catch (error) {
    …
  }
}
``` -->

## API

### `makeLib({ get, set, isEqual, cloneDeep })`

```ts
const makeLib: (parameters: {
  get: (target: any, path: string, defaultValue?: any) => any
  set: (target: any, path: string, value: any) => void
  isEqual: (a: any, b: any) => boolean
  cloneDeep: <T>(value: T) => T
}) => MakeForm
```

### `makeForm<T>({ initial, validate?, validationTriggers? })`

```ts
const makeForm: <T, ValidationErrors>(options: {
  initial: PartialDeep<T> // array or object
  validate: (value: PartialDeep<T>) => ValidationErrors | undefined
  validationTriggers: Array<'change' | 'blur' | 'focus' | 'reset' | 'validated'>
}) => Form<T, ValidationErrors>
```

**:warning: NB: You bring your own validation errors shape, the only requirement is that `undefined` is returned when no error**

### Form

#### `form.initial(path?)`

```ts
interface Initial<T> {
  initial(): PartialDeep<T> | undefined
  initial<P extends string>(path: P): PartialDeep<Get<T, P>> // strongly typed: value will be inferred from path
}

// Usage:
form.initial() // form initial value
form.initial('user.name.first') // initial sub value
form.initial('user.name') // initial sub value
```

#### `form.value(path?)`

```ts
interface Value<T> {
  value(): PartialDeep<T> | undefined
  value<P extends string>(path: P): PartialDeep<Get<T, P>> // strongly typed: value will be inferred from path
}

// Usage:
form.value() // form value
form.value('user.name.first') // sub value
form.value('user.name') // sub value
```

#### `form.isDirty(path?)`

A property is marked as dirty when its value is deeply unequal to its initial value.

```ts
type IsDirty = (path?: string) => boolean

// Usage:
form.isDirty() // check the whole form
form.isDirty('user.name.first') // check only a sub value
form.isDirty('user.name') // check only a subset of properties
```

#### `form.isModified(path?)`

A property is marked as modified when it is _changed_ − `form.change(path, …)` −, **no matter if the value is the same or different from the initial one**

```ts
type IsModified = (path?: string) => boolean

// Usage:
form.isModified() // check the whole form
form.isModified('user.name.first') // check only a sub value
form.isModified('user.name') // check only a subset of properties
```

#### `form.isVisited(path?)`

A property is marked as visited when it has gained focus once. Only a `form.reset(path?)` unmarks the poperty as "visited".

```ts
type IsVisited = (path?: string) => boolean

// Usage:
form.isVisited() // check the whole form
form.isVisited('user.name.first') // check only a sub value
form.isVisited('user.name') // check only a subset of properties
```

#### `form.isActive(path?)`

A property is marked as visited when it has gained focus once. Only a `form.reset(path?)` unmarks the poperty as "visited".

```ts
type IsActive = (path?: string) => boolean

// Usage:
form.isActive() // checks if one of the properties has focus
form.isActive('user.name.first') // check if a sub value has focus
form.isActive('user.name') // check if user.name.first OR user.name.last has focus
```

#### `form.change(formValue)` / `form.change(path, value)`

```ts
interface Change<T> {
  change(value: T | undefined): void
  change<P extends string>(
    path: P,
    value: PartialDeep<Get<T, P>> | undefined, // strongly typed: value will be inferred from path
  ): void
}

// Usage:
// change form value
form.change({
  user: {
    name: {
      first: 'John',
      last: 'Doe',
    },
  },
})

// change sub value
form.change('user.name.first', 'John')
form.change('user.name', {
  first: 'John',
  last: 'Doe',
})
```

#### `form.reset(nextInitialValue?)`

```ts
type Reset<T> = (nextInitialValue?: T) => void

// Usage:
// reset to current initial value
form.reset()

// reset to new initial value
form.reset({
  user: {
    name: {
      first: 'John',
      last: 'Doe',
    },
  },
})
```

#### `form.resetAt(path, nextInitialValue?)`

```ts
type ResetAt<T> = <P extends string>(
  path: P,
  nextInitialValue?: PartialDeep<Get<T, P>>, // strongly typed: value will be inferred from path
): void

// Usage:
// reset to current initial value
form.resetAt('user.name.first')
form.resetAt('user.name')

// reset to new initial value
form.resetAt('user.name.first', 'John')
form.resetAt('user.name', {
  first: 'John',
  last: 'Doe',
})
```

#### `form.blur(path)`

After a property has gained focus, blurring it marks the property as "not active" − see [`isActive(path?)`](formisactivepath).

:warning: Should be called only for primitive properties like string, number, date or booleans.

```ts
type Blur = (path: string) => void

// Usage:
form.blur('user.name.first')
form.blur('user.name.last')
```

#### `form.focus(path)`

Focusing a property marks it as visited and active − see [`isVisited(path?)`](#formisvisitedpath) and [`isActive(path?)`](#formisactivepath).

:warning: Should be called only for primitive properties like string, number, date or booleans.

```ts
type Blur = (path: string) => void

// Usage:
form.focus('user.name.first')
form.focus('user.name.last')
```

#### `form.on(event, listener)` / `form.on(path, event, listener)`

**NB:** The `path` is not relevant for `'validated'` event

```ts
interface On {
  on(
    event: 'change' | 'blur' | 'focus' | 'reset' | 'validated',
    listener: () => void,
  ): void
  on(
    path: string,
    event: 'change' | 'blur' | 'focus' | 'reset' | 'validated',
    listener: () => void,
  ): void
}

// Usage:
// 'change' examples
form.on('change', () => console.log('form value changed'))
form.on('user.name', 'change' () => console.log('form user name changed'))
form.on('user.name.first', 'change' () => console.log('form user first name changed'))

// 'blur' examples
form.on('blur', () => console.log('A form nested property has been blurred'))
form.on('user.name', 'blur' () => console.log('user first or last name has been blurred'))
form.on('user.name.first', 'blur' () => console.log('user first name has been blurred'))

// 'validated' examples − the path is not relevant here
form.on('validated', () => console.log('Form has been validated'))
form.on('user.name', 'validated' () => console.log('form has been validated'))
form.on('user.name.first', 'validated' () => console.log('form has been validated'))
```

#### `form.off(event, listener)`

```ts
type Off = (event: FormEvent, listener: () => void) => void

// Usage
const listener = () => console.log('value changed')
form.on('change', listener)
form.off('change', listener)

form.on('user.name.first', 'change', listener)
form.off('change', listener) // path is not required

form.on('user.name', 'change', listener)
form.off('change', listener) // path is not required
```

#### `form.validate()`

Populates form error with − your − `ValidationErrors` or `undefined`

```ts
type Validate = () => void

// Usage:
form.validate()
```

#### `form.errors()`

```ts
type Errors<ValidationErrors> = () => ValidationErrors | undefined

// Usage:
form.errors() // your error value or `undefined`
```

#### `form.isValid()`

Returns `true` when `form.errors()` is `undefined`. Basically.

```ts
type IsValid = () => boolean

// Usage:
form.validate() // sets the error
if (!form.isValid()) {
  throw new Error('…')
}
```

#### `submit(handler)`

**NB:** Under the hood, it validates the form − if a `validate` function was provided −, and executes the handler **only** if the form is valid.

```ts
export type Submit<T> = (handler: (value: T) => Promise<any>) => Promise<void>

// Usage:
await form.submit(async (values) => {
  const response = await fetch('/users', {
    method: 'POST',
    body: JSON.stringify({
      firstName: values.user.name.first,
      lastName: values.user.name.last,
    }),
  })
  if (!response.ok) throw new Error('Received an error')
})
```
