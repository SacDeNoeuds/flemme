<script setup lang="ts">
import { toRef, watchEffect } from 'vue';
import { FormValues, useRegistrationFormField } from './form';
import { Path } from 'flemme';

type ErrorsProps = {
    path: Path<FormValues>
}
const props = defineProps<ErrorsProps>();
const { errors, isTouched } = useRegistrationFormField(toRef(props, 'path'))
watchEffect(() => {
    console.debug('errors', errors.value)
})
</script>

<template>
    <small v-if="errors && errors.length > 0 && isTouched" class="feedback-error">
        Errors: {{
            errors.map((error) => `"${error.message}"`).join(', ')
        }}
    </small>
</template>