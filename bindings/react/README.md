# flemme-react

React bindings for `flemme`

## Table of contents

**API**

- [`<UseField form={…} path={…} watchers?={…} />`](#usefield-form-path-watchers-)
- [`useValue(form, path?)`](#usevalueform-path)
- [`useInitial(form, path?)`](#useinitialform-path)
- [`useDirty(form, path?)`](#usedirtyform-path)
- [`useModified(form, path?)`](#usemodifiedform-path)
- [`useVisited(form, path?)`](#usevisitedform-path)
- [`useActive(form, path?)`](#useactiveform-path)
- [`useErrors(form)`](#useerrorsform)
- [`useValid(form)`](#usevalidform)

## API

### `<UseField form={…} path={…} watchers?={…} />`

```tsx
import { Component, ReactNode } from 'react'

type UseField<FormValue, Path extends string> = Component<{
  form: Form<FormValue>
  path: Path
  // NOTE: by default, everything is watched
  watch?: Array<'value' | 'initial' | 'isDirty' | 'isModified' | 'isVisited' | 'isActive' | 'errors'>

  children: (state: {
    path: Path,
    value: InferredValueFrom<FormValues, Path>,
    initial: InferredValueFrom<FormValues, Path>,
    isDirty: boolean,
    isModified: boolean,
    isVisited: boolean,
    isActive: boolean,
    change: (value: InferredValueFrom<FormValues, Path> | undefined) => void,
    blur: () => void,
    focus: () => void,
    reset: (nextInitial?: InferredValueFrom<FormValues, Path>) => void,
    // NOTE: 'errors' is not provided, you have to call `form.errors()` inside the children function
    // but passing `watch={['errors']}` will rerun the children function on form errors change.
  }) => ReactNode
}>

// Usage:
type Values = {
  user: {
    names: { first: string, last: string },
  },
}
type ValidationErrors = Array<{ code: string, path: string }>
const MyForm = () => {
  const form = useMemo(() => makeForm<Values, ValidationErrors>({ initial: {}, validate: … }), [])

  return (
    <form onSubmit={…}>
      <UseField
        form={form}
        path={'user.names.first'}
        watch={/* optional */ ['value', 'errors', 'isVisited', 'isModified']}
      >
        {({ path, value, change, focus, blur, isVisited, isModified }) => {
          const errors = (form.errors() ?? []).filter((error) => error.path === path)
          const canDisplayFeedback = isVisited || isModified
          return (
            <div className="form-control">
              <input
                name={path}
                value={value ?? ''}
                onChange={(event) => change(event.target.value || undefined)}
                onBlur={blur}
                onFocus={focus}
              />

              <small className="form-feedback">
                {canDisplayFeedback && errors.length > 0 && errors.map((error) => {
                  switch (error.code) {
                    case 'required': return 'This field is required'
                    case 'too_small': return `${value?.length ?? 0} characters is a bit short for a first name…`
                    default: return `Unknown error "${error.code}"`
                  }
                }).join('\n')}
              </small>
            </div>
          )
        }}
      </UseField>

      {/* You can also use `UseField` for conditional rendering: */}
      <UseField form={form} path={'user.names.last'} watch={['value']}>
        {({ value }) => {
          if (value !== 'Batman') return null
          return 'Some stuff visible only to the Bat-eye'
        }}
      </UseField>
    </form>
  )
}
```

### `useValue(form, path)`

```ts
type UseValue = <FormValue, Path extends string>(form: Form<FormValue>, path: Path) => InferredValueFrom<FormValue, Path>

// Usage:
const userFirstName = useValue(form, 'user.names.first')
const userNames = useValue(form, 'user.names')
```

### `useInitial(form, path)`

```ts
type UseInitial = <FormValue, Path extends string>(form: Form<FormValue>, path: Path) => InferredValueFrom<FormValue, Path>

// Usage:
const initialUserFirstName = useInitial(form, 'user.names.first')
const initialUserNames = useInitial(form, 'user.names')
```

### `useDirty(form, path?)`

```ts
type UseDirty = (form: Form<any>, path?: string) => boolean

// Usage:
const isDirty = useDirty(form, path)
const isFieldDirty = useDirty(form, 'user.names.first')
const isFirstOrLastNameFieldDirty = useDirty(form, 'user.names')
const isFormDirty = useDirty(form) // any field of the form has been visited
```

### `useModified(form, path?)`

```ts
type UseModified = (form: Form<any>, path?: string) => boolean

// Usage:
const isModified = useModified(form, path)
const isFieldModified = useModified(form, 'user.names.first')
const isFirstOrLastNameFieldModified = useModified(form, 'user.names')
const isFormModified = useModified(form) // any field of the form has been visited
```

### `useVisited(form, path?)`

```ts
type UseVisited = (form: Form<any>, path?: string) => boolean

// Usage:
const isFieldVisited = useVisited(form, 'user.names.first')
const isFirstOrLastNameFieldVisited = useVisited(form, 'user.names')
const isFormVisited = useVisited(form) // any field of the form has been visited
```

### `useActive(form, path?)`

```ts
type UseActive = (form: Form<any>, path?: string) => boolean

// Usage:
const isFieldActive = useActive(form, 'user.names.first')
const isFirstOrLastNameFieldActive = useActive(form, 'user.names')
const formHasActiveField = useActive(form)
```

### `useErrors(form)`

```ts
type UseErrors = <ValidationErrors>(form: Form<any, ValidationErrors>) => ValidationErrors // the return type of _your_ validator

// Usage:
const errors = useErrors(form)
```

### `useValid(form)`

```ts
type UseValid = (form: Form<any>) => boolean

// Usage:
const isValid = useValid(form)
```
