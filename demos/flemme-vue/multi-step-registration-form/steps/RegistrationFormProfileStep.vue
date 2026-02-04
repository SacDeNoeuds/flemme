<script setup lang="ts">
import NameField from '../fields/NameField.vue'
import { useRegistrationFormField } from '../useRegistrationForm'

const emit = defineEmits<{
  (event: 'submit'): void
  (event: 'back'): void
}>()
const { isValid, validate, markAsTouched } = useRegistrationFormField('profile')

const handleSubmit = () => {
  markAsTouched()
  validate()
  if (isValid.value) emit('submit')
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <NameField path="firstName" label="First name" />
    <NameField path="lastName" label="Last name" />

    <!-- Cannot go to step 3 until profile info is valid -->
    <footer>
      <button class="discrete-button" type="button" @click="() => emit('back')">Back</button>
      <button class="button" type="submit">Go to next step</button>
    </footer>
  </form>
</template>
