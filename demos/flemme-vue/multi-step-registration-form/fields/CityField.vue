<script setup lang="ts">
import { useRegistrationFormField } from '../useRegistrationForm'
import Errors from './Errors.vue'

const { value, focus, blur, path } = useRegistrationFormField('billingAddress.city')
</script>

<template>
  <div class="form-field">
    <label :for="path">City</label>
    <input v-model="value" type="text" :id="path" :name="path" @focus="focus" @blur="blur" />
    <Errors :path="path" />
  </div>
</template>
