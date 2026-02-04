<script setup lang="ts">
import { Path } from 'flemme'
import { computed, toRef, watchEffect } from 'vue'
import { FormValues, useRegistrationFormField } from '../useRegistrationForm'

type ErrorsProps = {
  path: Path<FormValues>
}
const props = defineProps<ErrorsProps>()
const { errorMessage, isTouched, hasFormBeenSubmitted } = useRegistrationFormField(toRef(props, 'path'))

watchEffect(() => {
  console.debug('error', {
    path: props.path,
    errorMessage: errorMessage.value,
    isTouched: isTouched.value,
  })
})

const shouldDisplayErrorIfAny = computed(() => isTouched.value || hasFormBeenSubmitted.value)
</script>

<template>
  <small v-if="errorMessage && shouldDisplayErrorIfAny" class="feedback-error"> Errors: {{ errorMessage }} </small>
</template>
