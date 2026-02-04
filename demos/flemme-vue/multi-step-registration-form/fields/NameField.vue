<script setup lang="ts">
import { computed } from 'vue'
import { useRegistrationFormField } from '../useRegistrationForm'
import Errors from './Errors.vue'

type Props = {
  path: 'firstName' | 'lastName'
  label: string
}

const props = defineProps<Props>()

const path = computed(() => `profile.${props.path}` as const)
const { value, focus, blur } = useRegistrationFormField(path)
</script>

<template>
  <div class="form-field">
    <label :for="path">{{ props.label }}</label>
    <input v-model="value" type="text" :id="path" :name="path" @focus="focus" @blur="blur" />
    <Errors :path="path" />
  </div>
</template>
