<script setup lang="ts">
import EmailField from '../fields/EmailField.vue'
import PasswordField from '../fields/PasswordField.vue'
import { useRegistrationFormField } from '../useRegistrationForm'

const emit = defineEmits<{
  (event: 'submit'): void
}>()
const { isValid, validate, markAsTouched, form } = useRegistrationFormField('account')

const handleSubmit = () => {
  markAsTouched()
  validate()
  console.debug('form', {
    form: form.value,
    isValid: isValid.value,
  })
  if (isValid.value) emit('submit')
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <EmailField />
    <PasswordField />

    <!-- Cannot go to step 2 until account info is valid -->
    <button class="button" type="submit">Go to next step</button>
  </form>
</template>
