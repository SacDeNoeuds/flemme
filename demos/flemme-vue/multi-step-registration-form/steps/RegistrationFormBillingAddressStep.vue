<script setup lang="ts">
import CityField from '../fields/CityField.vue'
import StreetField from '../fields/StreetField.vue'
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
    <StreetField />
    <CityField />

    <!-- Cannot submit if billing address is invalid -->
    <footer>
      <button class="discrete-button" type="button" @click="() => emit('back')">Back</button>
      <button class="button" type="submit">Submit</button>
    </footer>
  </form>
</template>
