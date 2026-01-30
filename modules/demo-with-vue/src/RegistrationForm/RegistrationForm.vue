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

enum SubmitState {
  NotAsked = 'NotAsked',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
}

const submitState = ref(SubmitState.NotAsked)
const submittedValues = ref<FormValues>()

const { values, errors, submit } = useRegistrationForm({
  initialValues: toRef(props, 'initialValues'),
  submit: toRef(props, 'submit'),
})
const handleSubmit = () => {
  submitState.value = SubmitState.Pending
  submit()
    .then(() => {
      submitState.value = SubmitState.Success
    })
    .catch(() => {
      submitState.value = SubmitState.Failure
    })
  console.info('form errors', errors.value)
  submittedValues.value = { ...values.value }
}
</script>
<template>
  <form class="form" @submit.prevent="handleSubmit">
    <label>
      Submission state: {{ submitState }}
      <br />
    </label>

    <div v-if="submitState === SubmitState.Pending" class="dimmer" />
    <UsernameField />
    <PasswordField path="password" label="Password" />
    <PasswordField path="confirmation" label="Confirm password" />

    <TagFields />

    <Errors path="" />

    <hr />

    <div style="text-align: center">
      <button type="submit">Submit</button>
    </div>

    <h4>Last successful submitted result:</h4>
    <pre>
        <code>{{ submitState === SubmitState.Success && JSON.stringify(submittedValues, null, 2) }}</code>
      </pre>
  </form>
</template>
