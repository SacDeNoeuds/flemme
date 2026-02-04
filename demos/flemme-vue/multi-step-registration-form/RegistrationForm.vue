<script setup lang="ts">
import { ref, toRef } from 'vue'
import RegistrationFormAccountStep from './steps/RegistrationFormAccountStep.vue'
import RegistrationFormBillingAddressStep from './steps/RegistrationFormBillingAddressStep.vue'
import RegistrationFormProfileStep from './steps/RegistrationFormProfileStep.vue'
import { FormValues, useRegistrationForm } from './useRegistrationForm'

type Props = {
  initialValues?: FormValues
  submit: (values: FormValues) => Promise<unknown>
}
const props = defineProps<Props>()

enum SubmitState {
  NotAsked = 'NotAsked',
  Pending = 'Pending',
  Failure = 'Failure',
  Success = 'Success',
}
const submitState = ref(SubmitState.NotAsked)
const activeStep = ref<1 | 2 | 3>(1)

const { submit: submitRegistrationForm } = useRegistrationForm({
  initialValues: toRef(props, 'initialValues'),
  submit: toRef(props, 'submit'),
})

const { values, errors, submit } = useRegistrationForm({
  initialValues: toRef(props, 'initialValues'),
  submit: toRef(props, 'submit'),
})

const submittedValues = ref<FormValues>()
const handleSubmit = () => {
  submitState.value = SubmitState.Pending
  submit()
    .then(() => {
      submitState.value = SubmitState.Success
    })
    .catch(() => {
      submitState.value = SubmitState.Failure
    })
  console.info('form errors', errors.value)
  submittedValues.value = { ...values.value }
}
</script>
<template>
  <RegistrationFormAccountStep v-if="activeStep === 1" @submit="() => (activeStep = 2)" />
  <RegistrationFormProfileStep
    v-else-if="activeStep === 2"
    @back="() => (activeStep = 1)"
    @submit="() => (activeStep = 3)"
  />
  <RegistrationFormBillingAddressStep
    v-else-if="activeStep === 3"
    @back="() => (activeStep = 2)"
    @submit="handleSubmit"
  />

  <div v-if="submitState === SubmitState.NotAsked">Waiting for submission</div>
  <div v-else-if="submitState === SubmitState.Pending">Submitting</div>
  <div v-else-if="submitState === SubmitState.Failure">Failed to submit</div>
  <div v-else-if="submitState === SubmitState.Success">
    <h4>Last successful submitted result:</h4>
    <pre><code>{{ JSON.stringify(submittedValues, null, 2) }}</code></pre>
  </div>
</template>
