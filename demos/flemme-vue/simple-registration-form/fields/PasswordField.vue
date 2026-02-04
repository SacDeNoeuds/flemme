<script setup lang="ts">
import { toRef, watchEffect } from 'vue'
import { useRegistrationFormField } from '../useRegistrationForm'
import Errors from './Errors.vue'

type Props = {
  path: 'password' | 'confirmation'
  label: string
}
const props = defineProps<Props>()
const { path, value, focus, blur } = useRegistrationFormField(toRef(props, 'path'))
watchEffect(() => {
  console.debug(path.value, value.value)
})
</script>

<template>
  <div class="form-field">
    <label :for="path">{{ props.label }}</label>
    <input v-model="value" type="password" :id="path" :name="path" @focus="focus" @blur="blur" />
    <Errors :path="path" />
  </div>
</template>
