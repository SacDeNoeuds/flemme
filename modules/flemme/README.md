<p align="center">
  <img alt="Flemme Logo" src="https://github.com/SacDeNoeuds/flemme/blob/main/public/logo-200.png">
</p>

<p align="center">
  <a href="https://badge.fury.io/js/flemme">
    <img alt="npm version" src="https://badge.fury.io/js/flemme.svg">
  </a>

  <a href="https://www.npmjs.com/package/flemme">
    <img alt="Downloads" src="https://img.shields.io/npm/dm/flemme.svg">
  </a>

  <a href="http://standardjs.com" target="_blank">
    <img alt="js-standard-style" src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg">
  </a>

  <img alt="bundle size" src="https://deno.bundlejs.com/badge?q=flemme&treeshake=[{+createForm+}]">

  <img alt="Total coverage" src="https://raw.githubusercontent.com/SacDeNoeuds/flemme/refs/heads/main/modules/flemme/badges/coverage-total.svg">

  <img alt="Dependency Count" src="https://badgen.net/bundlephobia/dependency-count/flemme">
</p>

<!-- [!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/SacDeNoeuds) -->

# Flemme

Dependency-free\* framework-agnostic form management

The Bundle Size Badge is the size of the recommended installation, see it in action on <a href="https://bundlejs.com/?q=object-deep-copy%2Cjust-safe-get%2Cjust-safe-set%2Cfast-deep-equal%2Cflemme&treeshake=%5B%7B+default+as+objectDeepCopyDefault+%7D%5D%2C%5B%7B+default+as+get+%7D%5D%2C%5B%7B+default+as+set+%7D%5D%2C%5B%7B+default+as+fastDeepEqual+%7D%5D%2C%5B%7B+Flemme+%7D%5D">bundlejs.com</a>.

<small>\* See installation steps.</small>

− “Flemme” means “Laziness” in French.

---

Table of contents:

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [⚠️ Limitations](#-limitations)
- [Demos](#demos)
- [Philosophy](#philosophy)
- [API](#api)
  - [createForm<T>{ initial, submit, validate?, validationTriggers? }](#createformt-initialvalues-submit-schema-validationtriggers-)
  - [Form](#form)
    - [`form.initialValues`](#forminitialvalues)
    - [`form.values`](#formvalues)
    - [`form.get(path)`](#formgetpath)
    - [`form.isDirty() & isDirtyAt(path)`](#formisdirty--isdirtyatpath)
    - [`form.isTouched & isTouchedAt(path?)`](#formistouched--istouchedatpath)
    - [`form.set(values) / form.set(path, value)`](#formsetvalues--formsetpath-value)
    - [`form.reset(nextInitialValue?)`](#formresetnextinitialvalue)
    - [`form.resetAt(path, nextInitialValue?)`](#formresetatpath-nextinitialvalue)
    - [`form.blur(path)`](#formblurpath)
    - [`form.focus(path)`](#formfocuspath)
    - [`form.on(event, listener) / form.on(event, path, listener)`](#formonevent-listener--formonevent-path-listener)
    - [`form.validate()`](#formvalidate)
    - [`form.errors`](#formerrors)
    - [`form.isValid`](#formisvalid)
    - [`submit()`](#submit)
    - [`Form<T>`](#formt)
  - [Helpers](#helpers)
    - [`addItem(array, value, atIndex?)`](#additemarray-value-atindex)
    - [`removeItem(array, index)`](#removeitemarray-index)

## Installation

```sh
npm i -D flemme
```

**TS users**: Enabling proper types requires TS v4.1+ and type-fest v0.21+

**React users**: check out the React binding package [`flemme-react`](https://github.com/SacDeNoeuds/flemme/tree/main/modules/flemme-react)
**Vue users**: check out the Vue binding package [`flemme-vue`](https://github.com/SacDeNoeuds/flemme/tree/main/modules/flemme-vue)
**Vanilla users**: check out the DOM binding package [`flemme-dom`](https://github.com/SacDeNoeuds/flemme/tree/main/modules/flemme-dom)

## Basic usage

```ts
// src/path/to/user-form.(js|ts)
import { createForm, withSchema, addItem, removeItem /* for arrays */ } from 'flemme'

export const createUserProfileForm = (initialValues) => createForm({
  initialValues,
  schema: userSchema, // any standard schema is supported: zod's, valibot, unhoax, …

  // all available triggers, pick only a subset of course (ideally one only)
  // I advise ['change', 'blur']
  validationTriggers: ['change', 'blur', 'focus', 'reset'],
  submit: async (values) => {
    await fetch('…', {})
  },
})

const form = createUserProfileForm({
  name: { first: 'John', last: 'Doe' },
  birthDate: new Date('1968-05-18'),
  tags: ['awesome guy', 'great dude'],
})

// mimic actual user actions
form.focus('name.first')
form.set('name.first', 'Fred')
form.blur('name.first')

form.focus('name.last')
form.set('name.last', 'Aster')
form.blur('name.last')

form.focus('tags.1')
form.set('tags.1', 'great dancer') // replaces "great dude" by "great dancer"
form.blur('tags.1')

// Array add/append value
form.set('tags.2', 'Lovely') // since index 2 does not exist, it will be added
form.set('tags', add(form.value('tags'), 'Kind hearted')) // append tag
form.set('tags', add(form.value('tags'), 'Subtle guy', 1)) // add at index 1

// Array remove value
form.set('tags', remove(form.value('tags'), 1)) // remove tag at index 1

form.submit()
  .then(() => {…})
  .catch(() => {…})
```

## ⚠️ Limitations

- The top-level value _must_ be an object or an array
- Properties cannot contain a `.` because of the path notation. `const values = { 'toto.tata': 'Hello !' }` will not work.
- Only serializable types are supported, which excludes:
  - Set
  - Map
  - Iterables
  - symbol
  - functions
  - etc.

## Demos

- With `zod` validation: [demo](https://sacdenoeuds.github.io/flemme/with-zod/) | [source](https://github.com/SacDeNoeuds/flemme/blob/main/modules/demo-with-zod)
- With `unhoax` validation: [demo](https://sacdenoeuds.github.io/flemme/with-unhoax/) | [source](https://github.com/SacDeNoeuds/flemme/blob/main/modules/demo-with-unhoax)
- With React: [demo](https://sacdenoeuds.github.io/flemme/with-react/) | [source](https://github.com/SacDeNoeuds/flemme/blob/main/modules/demo-with-react)
- With Vue: [demo](https://sacdenoeuds.github.io/flemme/with-vue/) | [source](https://github.com/SacDeNoeuds/flemme/blob/main/modules/demo-with-vue)
- With DOM (vanilla): [demo](https://sacdenoeuds.github.io/flemme/with-dom/) | [source](https://github.com/SacDeNoeuds/flemme/blob/main/modules/demo-with-unhoax)

## Philosophy

Handling forms means two main parts:

1. Form **state**, such as dirty/pristine, touched/modified, visited, active and state mutations
2. Form **validation**

And it should have to be testable in any environment (browser, node, deno, etc.).

About form **validation**, there already exist wonderful tools to validate schema or even add cross-field validation, the idea is to _not_ reimplement one. Among those tools:

- [zod](https://github.com/colinhacks/zod)
- [unhoax](https://github.com/SacDeNoeuds/unhoax)
- [superstruct](https://docs.superstructjs.org/)
- [io-ts](https://gcanti.github.io/io-ts/)
- [jsonschema](https://github.com/tdegrunt/jsonschema) − validates [JSON Schema declarations](http://json-schema.org/)
- …

Since TypeScript v4.1, lodash-path related function can be strongly typed, therefore using lodash-like path felt like a commonly known API to propose.

Now you ought to know (if you don’t yet): a great framework-agnostic form library already exists: [final-form](https://final-form.org/). However, I find the API and config not to be _that_ straightforward. FYI, it’s 16.9kB and has a separate package for arrays while this one is 1.82KB.
Another advantage of final-form is its very [complete ecosystem](https://final-form.org/docs/final-form/companion-libraries).

## API

### `createForm<T>({ initialValues, submit, schema?, validationTriggers? })`

```ts
const createForm: <T>(options: {
  initialValues: T // array or object
  schema: StandardSchema<T>
  validationTriggers: Array<'change' | 'blur' | 'focus' | 'reset' | 'validated'>
  submit: (values: T) => Promise<unknown>
}) => Form<T>
```

### Form

#### `form.initialValues`

```ts
interface Initial<T> {
  readonly initialValues: T
  getInitial<P extends Paths<T>>(path: P): Get<T, P>
}

// Usage:
form.initialValues // form initial value
form.initialValues.user.name.first // initial sub value
form.getInitial('user.name.first') // string
```

#### `form.values`

```ts
interface Values<T> {
  readonly values: T
}

// Usage:
form.values // form initial value
form.values.user.name.first // initial sub value
```

#### `form.get(path)`

```ts
interface Value<T> {
  get<P extends Paths<T>>(path: P): Get<T, P> // strongly typed: value will be inferred from path
}

// Usage:
form.get('user.name.first') // string
form.get('user.name') // { first: string, last: string }
```

#### `form.isDirty` & `isDirtyAt(path)`

A field is marked as "dirty" when its value is deeply unequal to its initial value.

```ts
// Usage:
form.isDirty // check the whole form
form.isDirtyAt('user.name.first') // check only a sub value
form.isDirtyAt('user.name') // check only a subset of properties
```

#### `form.isTouched` & `isTouchedAt(path)`

A field is marked as "touched" when it has gained focus once. Only a `form.reset(path?)` unmarks the field as "touched".

```ts
type IsTouched = (path?: string) => boolean

// Usage:
form.isTouched // check the whole form
form.isTouchedAt('user.name.first') // check only a sub value
form.isTouchedAt('user.name') // check only a subset of properties
```

#### `form.set(values)` / `form.set(path, value)`

```ts
interface Set<T> {
  set(value: T): void
  set<P extends Paths<T>>(
    path: P,
    value: Get<T, P>, // strongly typed: value will be inferred from path
  ): void
}

// Usage:
// change form value
form.set({
  user: {
    name: {
      first: 'John',
      last: 'Doe',
    },
  },
})

// change sub value
form.set('user.name.first', 'John')
form.set('user.name', {
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

⚠️ Should be called only for primitive properties like string, number, date or booleans.

```ts
type Blur = (path: string) => void

// Usage:
form.blur('user.name.first')
form.blur('user.name.last')
```

#### `form.focus(path)`

⚠️ Should be called only for primitive properties like string, number, date or booleans.

```ts
type Focus = (path: string) => void

// Usage:
form.focus('user.name.first')
form.focus('user.name.last')
```

#### `form.on(event, listener)` / `form.on(event, path, listener)`

**NB:** The `path` is not relevant for `'validated'` event

```ts
// Usage:
// 'change' examples
const unsubscribe = form.on('change', ({ path, previous, next }) => {
  console.log('form value changed', path, previous, next)
})
unsubscribe()

form.on('change', 'user.name', ({ path }) => console.log('form user name changed'))
form.on('change', 'user.name.first', ({ path }) => console.log('form user first name changed'))

// 'blur' examples
form.on('blur', ({ path }) => console.log('A form nested property has been blurred'))
form.on('blur', 'user.name', ({ path }) => console.log('user first or last name has been blurred'))
form.on('blur', 'user.name.first', ({ path }) => console.log('user first name has been blurred'))

// 'validated' examples − the path is not relevant here
form.on('validated', ({ errors }) => console.log('Form has been validated'))

form.on('submit', ({ values }) => {
  console.log('submit started')
})
form.on('submitted', ({ values, error }) => {
  console.log('is success:', !error)
  console.log('submitted values:', values)
})

// returns an `unsubscribe` function
interface On {
  <P extends Paths<T>>(
    event: 'reset' | 'change',
    path: P,
    listener: (data: { path: P; previous: Get<T, P>; next: Get<T, P> }) => unknown,
  ): () => void
  (event: 'reset' | 'change', listener: (data: { path: ''; previous: T; next: T }) => unknown): () => void

  <P extends Paths<T>>(event: 'focus' | 'blur', path: P, listener: (data: { path: P }) => unknown): () => void
  (event: 'focus' | 'blur', listener: (data: { path: Paths<T> }) => unknown): () => void

  (event: 'validated', listener: (data: { errors: ValidationErrors | undefined }) => unknown): () => void

  (event: 'submit', listener: (data: { values: T }) => unknown): () => void
  (event: 'submitted', listener: (data: { values: T; error?: unknown }) => unknown): () => void
}
```

#### `form.validate()`

Populates form error with found errors or `undefined`

Emits a `'validated'` event.

```ts
type Validate = () => void

// Usage:
form.validate()
```

#### `form.errors`

```ts
type Errors<FormValues> = {
  readonly errors: Array<{ message: string; path: Paths<FormValues> }> | undefined
}

// Usage:
form.errors
```

#### `form.isValid`

Returns `true` when `form.errors` is `undefined`. Basically.

```ts
type IsValid = {
  readonly isValid: boolean
}

// Usage:
form.validate() // sets the error
if (!form.isValid) {
  throw new Error('…')
}
```

#### `submit()`

**NB:** Under the hood, it validates the form − if a `validate` function was provided −, and executes the handler **only** if the form is valid.

If the form is valid, it emits the event `'submit'` when starting submission, then `'submitted'` when done (succeeding or failing).

```ts
export type Submit<T> = (handler: (value: T) => Promise<any>) => Promise<void>

// Usage:
import { createForm } from 'flemme'

const form = createForm({
  …,
  submit: async (values) => {
    const response = await fetch('/users', {
      method: 'POST',
      body: JSON.stringify({
        firstName: values.user.name.first,
        lastName: values.user.name.last,
      }),
    })
    if (!response.ok) throw new Error('Received an error')
  }
})

await form.submit()
```

#### `Form<T>`

```ts
export type Form<T> = {
  // readers
  readonly initialValues: T
  readonly values: T
  readonly errors: Array<{ message: string; path: Paths<T> }>
  readonly isValid: boolean
  readonly isDirty: boolean
  readonly isTouched: boolean

  get<P extends Paths<T>>(path: P): Get<T, P>

  isDirtyAt(path: Paths<T>): boolean
  isTouchedAt(path: Paths<T>): boolean

  // actions/operations
  set: {
    (value: T): void
    <P extends Paths<T>>(path: P, value: Get<T, P> | undefined): void
  }

  reset: (nextInitialValue?: T) => void
  resetAt: <P extends Paths<T>>(path: P, nextInitialValue?: Get<T, P & string>) => void

  blur: (path: Paths<T>) => void
  focus: (path: Paths<T>) => void

  submit: () => Promise<unknown>
  validate: () => void

  // events
  on: {
    <P extends Paths<T>>(event: 'reset' | 'change', path: P, listener: ChangeListener<T, P>): () => void
    (event: 'reset' | 'change', listener: ChangeListener<T>): () => void
    <P extends Paths<T>>(event: 'focus' | 'blur', path: P, listener: FocusListener<T, P>): () => void
    (event: 'focus' | 'blur', listener: FocusListener<T>): () => void
    (event: 'validated', listener: () => void): () => void
    (event: 'submit', listener: (data: { values: T }) => unknown): () => void
    (event: 'submitted', listener: (data: { values: T; error?: unknown }) => unknown): () => void
  }
}
```

### Helpers

**NB**: The lib is tree-shakeable. Therefore if you don’t use any of these, they won’t jump into your bundle 🪶

#### `addItem(array, value, atIndex?)`

```ts
import { addItem } from 'flemme'

const myArray = ['a', 'b', 'c', 'd']
const myNewArray1 = addItem(myArray, 'e') // append 'e'
const myNewArray2 = addItem(myArray, 'e', 2) // ['a', 'b', 'e', 'c', 'd']
```

#### `removeItem(array, index)`

```ts
import { removeItem } from 'flemme'

const myArray = ['a', 'b', 'c', 'd']
const myNewArray1 = removeItem(myArray, 2) // removes 'c' → ['a', 'b', 'd']
const myNewArray2 = removeItem(myArray, 123) // removes nothing
const myNewArray3 = removeItem(myArray, -1) // removes nothing
```
