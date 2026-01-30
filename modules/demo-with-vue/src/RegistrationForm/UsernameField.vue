<script setup lang="ts">
import Errors from './Errors.vue'
import { useRegistrationFormField } from './useRegistrationForm'

const { value, focus, blur, path } = useRegistrationFormField('username')
</script>

<template>
  <label>
    Username
    <input v-model="value" type="text" :id="path" :name="path" @focus="focus" @blur="blur" />
    <Errors :path="path" />
  </label>
</template>
