---
name: flemme-vue
description: Build re-usable type-safe forms in Vue with flemme
---

# How to use flemme-vue

## When to use

- You need to build a form in Vue using Composition API.
- You want proper validation, error messages and state.

When NOT to use:

- for forms with no validation
- for forms with dead-simple states

## Installation

```bash
npm i -S flemme-vue
```

## Usage

### 1. Define your form in a composable

For example, let's take a registration form:
Type-first approach
Using TypeScript interfaces allows types to have proper name rather than displaying the type contents. A type content can be cryptic while a type name is always explicit.

```ts
import { RegistrationFormValues } from '@standard-schema/spec'
import { createForm } from 'flemme-vue'

export interface RegistrationFormValues {
  // …
}
// any standard-schema compliant lib does the trick
export const registrationFormValuesSchema = z.object() satisfies StandardSchema<RegistrationFormValues, RegistrationFormValues>

export const [useRegistrationForm, useRegistrationFormField] = createForm<RegistrationFormValues>({
  schema: registrationFormValuesSchema,
  validationTriggers: ['blur'], // pick among 'blur' | 'change' | 'focus'
  defaultInitialValues: { … },
})
```

<details>
<summary>Schema-first approach</summary>

```ts
import { RegistrationFormValues } from '@standard-schema/spec'
import { createForm } from 'flemme-vue'

// any standard-schema compliant lib does the trick
export const registrationFormValuesSchema = z.object(…)

export const [useRegistrationForm, useRegistrationFormField] = createForm({
  schema: registrationFormValuesSchema,
  validationTriggers: ['blur'], // pick among 'blur' | 'change' | 'focus'
  defaultInitialValues: { … },
})
```

</details>

### 2. Define the form component

To be reusable, a form always has two properties:

1. Initial values (optional), which are provided in case of edition and omitted in case of creation
2. a `submit` function, which may differ for creation and edition

```vue
<script setup lang="ts">
import { ref, toRef } from 'vue'
import { type FormValues, useRegistrationForm } from './useRegistrationForm'
import UsernameField from './UsernameField.vue'
import PasswordField from './PasswordField.vue'
import TagFields from './TagFields.vue'
import Errors from './Errors.vue'

type Props = {
  initialValues?: FormValues
  submit: (values: FormValues) => Promise<unknown>
}
const props = defineProps<Props>()

// trivial type, use your own `RemoteData`-ish from your projects, ie: a @pinia/colada mutation
type SubmitState = 'notAsked' | 'pending' | 'failure' | 'success'
const submitState = ref<SubmitState>('notAsked')

const { submit } = useRegistrationForm({
  initialValues: toRef(props, 'initialValues'),
  submit: toRef(props, 'submit'),
})
const handleSubmit = () => {
  submitState.value = 'pending'
  submit()
    .then(() => {
      submitState.value = 'success'
    })
    .catch(() => {
      submitState.value = 'failure'
    })
}
</script>
<template>
  <form class="form" @submit.prevent="handleSubmit">
    <!-- Insert fields here -->

    <button type="submit">Submit</button>
  </form>
</template>
```

### 3a. Define a field component for a top level value

ie: our registration form email field:

```vue
<script setup lang="ts">
import Errors from './Errors.vue'
import { useRegistrationFormField } from './useRegistrationForm'

const { value, focus, blur, path } = useRegistrationFormField('email')
</script>

<template>
  <div class="form-field">
    <label :for="path">Email</label>
    <input v-model="value" type="email" :id="path" :name="path" @focus="focus" @blur="blur" />
    <Errors :path="path" />
  </div>
</template>
```

### 3b. Define a field component for a nested value

ie: our registration form email field:

```vue
<script setup lang="ts">
import Errors from './Errors.vue'
import { useRegistrationFormField } from './useRegistrationForm'

const { value, focus, blur, path } = useRegistrationFormField('name.first')
</script>

<template>
  <div class="form-field">
    <label :for="path">First name</label>
    <input v-model="value" type="text" :id="path" :name="path" @focus="focus" @blur="blur" />
    <Errors :path="path" />
  </div>
</template>
```

### 4. Define a field component for an array value

Let's take the example of tags of shape `type Tag = { id: string, label: string }` with a min length of 1.

```vue
<script setup lang="ts">
import { useMyForm } from './useMyForm'
import TagField from './TagField.vue'

const { value } = useMyForm('tags')

function addTag() {
  // NOTE: array values are readonly, you must assign the ref value
  // You cannot use mutating methods like `.push(…)`
  value.value = value.value.concat({
    id: crypto.randomUUID(),
    label: `New Tag ${value.value.length + 1}`,
  })
}

function removeTagAt(index: number) {
  // NOTE: array values are readonly, you must assign the ref value
  // You cannot use mutating methods like `.splice(…)`
  value.value = value.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div>
    <h4>Tags</h4>
    <TagField v-for="(tag, index) in value" :key="tag.id" :index="index" @remove="() => removeTagAt(index)" />
    <button type="button" @click="addTag">Add</button>

    <!-- Displays the minLength error if the `tags` array is empty -->
    <Errors path="tags" />
  </div>
</template>
```

### 5. Define a field component for a nested array value

Let's implement our TagLabelField:

```vue
<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useRegistrationFormField } from './useRegistrationForm'
import Errors from './Errors.vue'

type Props = {
  index: number
}
const props = defineProps<Props>()
const emit = defineEmits<(e: 'remove') => void>()

const path = computed(() => `tags.${props.index}.label` as const)
const { value, blur, focus } = useRegistrationFormField(path)
</script>

<template>
  <div>
    <label>
      Tag #{{ index + 1 }}
      <input v-model="value" type="text" @focus="focus" @blur="blur" />
      <Errors :path="path" />
    </label>
    <button type="button" @click="() => emit('remove')">Remove</button>
  </div>
</template>
```

### 6. Define an error component

An error component is useful to display any error at any path:

```vue
<script setup lang="ts">
import { computed, toRef } from 'vue'
import { RegistrationFormValues, useRegistrationFormField } from './useRegistrationForm'
import { Path } from 'flemme'

type Props = {
  path: Path<RegistrationFormValues>
}
const props = defineProps<Props>()
const { errorMessage, isTouched, hasFormBeenSubmitted } = useRegistrationFormField(toRef(props, 'path'))

const shouldDisplayErrorIfAny = computed(() => isTouched.value || hasFormBeenSubmitted.value)
</script>

<template>
  <small v-if="errorMessage && shouldDisplayErrorIfAny" class="feedback-error">
    {{ errorMessage }}
  </small>
</template>
```

This component will retrieve the error at the path where the error is specified:

```ts
const formValuesSchema = z.object({
  tags: z
    .array(
      z.object({
        id: z.uuid(),
        label: z.string().min(10), // <-- error is displayed via `<Errors path="tags.{index}.label" />
      }),
    )
    .min(1), // <-- error is displayed via `<Errors path="tags" />`
})
```

## Limitations

- A form can only be used once per page, no concurrent forms.
- Dots in property names are disallowed because they clash with `path` handling.
- Form values are necessarily an object or an array. If you have one value only, wrap it into a property.
- Only object, arrays and primitives are supported. Typically `Set` and `Map` are not supported.

## Recommendations

### Split fields in as many components as possible

For re-usability _and_ readability, I recommend writing dedicated components for each field:

- EmailField
- PasswordField
- TagsFields (array field)
- TagLabelField
- etc.

### Do not check validity, do something with errors instead

The `useForm` composable (in `const [useForm] = createForm(…)`) does _not_ provide any `isValid` state because:

1. You can check the existence of errors for validity – `errors.length === 0`
2. `isValid` is usually used to block submission, which is a UI anti-pattern ; forms should allow submission and report errors either via field hints or another mechanism like modals or dialogs

## References

- `flemme-vue` [README](https://github.com/SacDeNoeuds/flemme/tree/main/modules/flemme-vue/README.md)
- `flemme` [README](https://github.com/SacDeNoeuds/flemme/tree/main/modules/flemme/README.md)
