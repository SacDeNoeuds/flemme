---
name: forms-in-react-with-flemme
description: How to build forms in React using Flemme.
compatibility: opencode
---

## Overview

flemme-react is a React binding for the flemme form library that provides a declarative way to create and manage forms with validation.

## Key concepts

- `createForm` creates a form hook pair: `[useForm, useField]`
- Form values are strongly typed using any standard-schema (zod, unhoax, yup, arktype, etc)
- Validation triggers can be configured (change, blur, etc.)
- Fields can be accessed using path-based selectors
- Built-in hooks for tracking field state (touched, dirty, errors)

## Basic Usage

1. Define your form schema with standard-schema-compatible library, for instance Zod.
2. Create a form hook using flemme-react's `createForm`
3. Use the form hook in components to access form data and validation
4. Use field hooks to manage individual field states

## Example Implementation

Picture a backoffice application allowing to create or edit accounts.

```ts
import { createForm } from 'flemme-react'
import z from 'zod'

const formValuesSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(100),
    confirmation: z.string(),

    // demo with arrays
    subscriptions: z.array(
      z.object({
        kind: z.enum(['newsletters', 'promotions'])
        channel: z.enum(['email', 'text']),
      })
    ),

    // demo with nested values
    user: {
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      birthDate: z.coerce.date(),
    },
  })
  .refine((values) => values.password === values.confirmation, {
    message: 'Passwords must match',
  })

export type AccountFormValues = z.input<typeof formValuesSchema>
export type ParsedAccountFormValues = z.output<typeof formValuesSchema>

// Create form hooks, automatically infers `FormAccountValues` and `ParsedAccountFormValues`
export const [useAccountForm, useAccountFormField] = createForm({
  schema: formValuesSchema,
  validationTriggers: ['change', 'blur'],
  defaultInitialValues: {
    email: '',
    password: '',
    confirmation: '',
    subscriptions: [],
    user: {
      firstName: '',
      lastName: '',
      birthDate: null,
    },
  },
})
```

## Usage in components

```tsx
import { type FormAccountValues, useAccountForm, useAccountFormField } from './account-form.ts'
import EmailField from './EmailField.tsx'

type Props = {
  initialValues?: FormAccountValues
  onSubmit: () => Promise<unknown> // can be used to create an account or update one.
}

type SubmitState = 'idle' | 'pending' | 'failure' | 'success'
export const AccountForm = (props: Props) => {
  const { form, errors } = useAccountForm({
    initialValues: props.initialValues,
    submit: props.onSubmit,
  })
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const submit = (event: Event) => {
    event.preventDefault()
    setSubmitState('pending')
    form
      .submit()
      .then(() => setSubmitState('success'))
      .catch(() => setSubmitState('failure'))
  }

  return (
    <form onSubmit={submit}>
      <EmailField />

      <PasswordField path="password" />
      <PasswordField path="confirmation" />

      <UserNameField path="user.firstName" />
      <UserNameField path="user.lastName" />

      <hr />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Demo of a field with a known-in-advance `path`

With `EmailField`

```tsx
import { useAccountFormField } from './account-form.ts'

export default function EmailField() {
  const { path, value, change, blur, focus } = useAccountFormField('email')

  return (
    <div className="form-field">
      <label htmlFor={path}>Email</label>
      <input
        type="email"
        id={path}
        name={path}
        value={value}
        onChange={(event) => change(event.target.value)}
        onBlur={blur}
        onFocus={focus}
      />
      <FieldErrors path={path} />
    </div>
  )
}
```

### Demo of a field with a dynamic `path`

With `PasswordField`

```tsx
import { useAccountFormField } from './account-form.ts'

type Props = {
  label: string
  path: 'password' | 'confirmation'
}
export default function PasswordField({ path, label }: Props) {
  const { value, change, blur, focus } = useAccountFormField(path)

  return (
    <div className="form-field">
      <label htmlFor={path}>{label}</label>
      <input
        type="password"
        id={path}
        name={path}
        value={value}
        onChange={(event) => change(event.target.value)}
        onBlur={blur}
        onFocus={focus}
      />
      <FieldErrors path={path} />
    </div>
  )
}
```

### Field errors by path

```tsx
import type { FlemmePaths } from 'flemme'
import { type AccountFormValues, useAccountFormField } from './account-form.ts'

type Props = {
  path: FlemmePaths<AccountFormValues>
}
export default function FieldError({ path }: Props) {
  const { errors, isTouched } = useAccountFormField(path)
  if (!errors || !isTouched) return null

  return <small className="field-errors">{errors.join('\n')}</small>
}
```

### Demo of a field with a nested path on an object

With `UserNameField` for user first and last name:

```tsx
type Props = {
  path: 'user.firstName' | 'user.lastName'
}
export default function UserNameField({ path }) {
  const { value, change, blur, focus } = useAccountFormField(path)

  return (
    <div className="form-field">
      <label htmlFor={path}>{label}</label>
      <input
        type="text"
        id={path}
        name={path}
        value={value}
        onChange={(event) => change(event.target.value)}
        onBlur={blur}
        onFocus={focus}
      />
      <FieldErrors path={path} />
    </div>
  )
}
```

### Demo of a field with a nested path on an array

With `SubscriptionKindField`:

```tsx
type Props = {
  path: `subscriptions.${number}.kind`
}
export default function SubscriptionKindField({ path }) {
  const { value, change, blur, focus } = useAccountFormField(path)

  return (
    <div className="form-field">
      <label htmlFor={path}>Subscription</label>
      <select
        id={path}
        name={path}
        value={value}
        onChange={(event) => change(event.target.value)}
        onBlur={blur}
        onFocus={focus}
      >
        <option value="newsletters">Newsletters</option>
        <option value="promotions">Promotions</option>
      </select>
      <FieldErrors path={path} />
    </div>
  )
}
```

### Demo of an array field

With `SubscriptionsField`:

```tsx
type Props = {
  path: `subscriptions.${number}`
}
export default function SubscriptionsFields({ path }: Props) {
  const { value, change } = useAccountFormField(path)

  const addSubscription = () => {
    change([...value, { kind: 'newsletter', channel: 'email' }])
  }
  const removeSubscriptionAt = (index: number) => {
    change(value.filter((_, i) => i !== index))
  }

  return (
    <div className="account-subscriptions">
      <div>
        <h4>Subscription</h4>
        <button type="button" aria-label="Add" onClick={addSubscription}>
          {'+'}
        </button>
      </div>
      {value.map((subscription, index) => (
        <div key={index} class="form-group">
          <SubscriptionKind path={`${path}.${index}.kind`} />
          <SubscriptionChannel path={`${path}.${index}.channel`} />
          <button type="button" aria-label="Remove" onClick={() => removeSubscriptionAt(index)}>
            {'x'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Field API

- `value` - Current value of the field
- `initial` - Initial value of the field
- `errors` - Validation errors for this field
- `isTouched` - Whether the field has been touched
- `isDirty` - Whether the field value is different than the initial value
- `change(newValue)` - Update field value
- `focus()` - marks the field as `touched`. Triggers validation if `validationTriggers` includes `'focus'`
- `blur()` - Triggers validation if `validationTriggers` includes `'blur'`.
