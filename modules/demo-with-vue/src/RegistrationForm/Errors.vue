<script setup lang="ts">
import { computed, toRef } from 'vue';
import { FormValues, useRegistrationFormField } from './form';
import { Path } from 'flemme';

type ErrorsProps = {
    path: Path<FormValues>
}
const props = defineProps<ErrorsProps>();
const { errors, isTouched, hasFormBeenSubmitted } = useRegistrationFormField(toRef(props, 'path'))

const shouldDisplayErrorIfAny = computed(() => isTouched.value || hasFormBeenSubmitted.value)
</script>

<template>
    <small v-if="errors && errors.length > 0 && shouldDisplayErrorIfAny" class="feedback-error">
        Errors: {{
            errors.map((error) => `"${error.message}"`).join(', ')
        }}
    </small>
</template>