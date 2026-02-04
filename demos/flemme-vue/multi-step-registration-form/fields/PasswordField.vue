<script setup lang="ts">
import { useRegistrationFormField } from '../useRegistrationForm'
import Errors from './Errors.vue'

const { path, value, focus, blur } = useRegistrationFormField('account.password')
</script>

<template>
  <div class="form-field">
    <label :for="path">Password</label>
    <input v-model="value" type="password" :id="path" :name="path" @focus="focus" @blur="blur" />
    <Errors :path="path" />
  </div>
</template>
