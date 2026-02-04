<script setup lang="ts">
import { sleep } from '../lib/sleep'
import RegistrationForm from './RegistrationForm.vue'
import { FormValues } from './useRegistrationForm'

async function register(values: FormValues) {
  await sleep(750)
  console.info('submitted:', values)
}
</script>

<template>
  <div class="app">
    <h2>Registration form</h2>
    <RegistrationForm :submit="register" />
  </div>
</template>
<style>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
form footer {
  display: flex;
  gap: 0.5rem;
  & button {
    flex: 1;
  }
}
</style>
