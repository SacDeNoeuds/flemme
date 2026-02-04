<script setup lang="ts">
import { ref, toRef } from 'vue'
import Errors from './fields/Errors.vue'
import PasswordField from './fields/PasswordField.vue'
import TagFields from './fields/TagFields.vue'
import UsernameField from './fields/UsernameField.vue'
import { type FormValues, useRegistrationForm } from './useRegistrationForm'

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
    <output>
      Submission state: {{ submitState }}
      <br />
    </output>

    <div v-if="submitState === SubmitState.Pending" class="dimmer" />
    <UsernameField />
    <PasswordField path="password" label="Password" />
    <PasswordField path="confirmation" label="Confirm password" />

    <TagFields />

    <Errors path="" />

    <hr />

    <div style="text-align: center">
      <button class="button" type="submit">Submit</button>
    </div>

    <div v-if="submitState === SubmitState.Success">
      <h4>Last successful submitted result:</h4>
      <pre><code>{{ JSON.stringify(submittedValues, null, 2) }}</code></pre>
    </div>
  </form>
</template>
<style>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
