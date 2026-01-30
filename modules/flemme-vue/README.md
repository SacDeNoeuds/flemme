[![npm version](https://badge.fury.io/js/flemme-vue.svg)](https://badge.fury.io/js/flemme-vue)
[![Downloads](https://img.shields.io/npm/dm/flemme-vue.svg)](https://www.npmjs.com/package/flemme-vue)

<!-- [!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/SacDeNoeuds) -->

# flemme-vue

Vue bindings for [`flemme`](https://github.com/SacDeNoeuds/flemme/tree/main/modules/flemme)

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Define your form in a composable](#define-your-form-in-a-composable)
  - [Define the form component](#define-the-form-component)
  - [a. Define a field component for a top level value](#a-define-a-field-component-for-a-top-level-value)
  - [b. Define a field component for a nested value](#b-define-a-field-component-for-a-nested-value)
  - [Define a field component for an array value](#define-a-field-component-for-an-array-value)
  - [Define a field component for a nested array value](#define-a-field-component-for-a-nested-array-value)
  - [Define an error component](#define-an-error-component)
- [Design decisions](#design-decisions)
- [Limitations](#limitations)

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
<!-- TOC -->

- [flemme-vue](#flemme-vue)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Define your form in a composable](#define-your-form-in-a-composable)
    - [Define the form component](#define-the-form-component)
    - [a. Define a field component for a top level value](#a-define-a-field-component-for-a-top-level-value)
    - [b. Define a field component for a nested value](#b-define-a-field-component-for-a-nested-value)
    - [Define a field component for an array value](#define-a-field-component-for-an-array-value)
    - [Define a field component for a nested array value](#define-a-field-component-for-a-nested-array-value)
    - [Define an error component](#define-an-error-component)
  - [Design decisions](#design-decisions)
  - [Limitations](#limitations)

<!-- /TOC -->
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

Let's take the example of tags of shape `type Tag = { id: string, label: string }`

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

## Design decisions

This library only exposes a composable API on purpose, there is no plan to support a component API.

## Limitations

- A form can only be used once per page, no concurrent forms.
- Dots in property names are disallowed because they clash with `path` handling.
- Form values are necessarily an object or an array. If you have one value only, wrap it into a property.
- Only object, arrays and primitives are supported. Typically `Set` and `Map` are not supported.
