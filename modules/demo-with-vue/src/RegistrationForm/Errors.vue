<script setup lang="ts">
import { computed, toRef } from 'vue'
import { FormValues, useRegistrationFormField } from './useRegistrationForm'
import { Path } from 'flemme'

type ErrorsProps = {
  path: Path<FormValues>
}
const props = defineProps<ErrorsProps>()
const { errorMessage, isTouched, hasFormBeenSubmitted } = useRegistrationFormField(toRef(props, 'path'))

const shouldDisplayErrorIfAny = computed(() => isTouched.value || hasFormBeenSubmitted.value)
</script>

<template>
  <small v-if="errorMessage && shouldDisplayErrorIfAny" class="feedback-error"> Errors: {{ errorMessage }} </small>
</template>
