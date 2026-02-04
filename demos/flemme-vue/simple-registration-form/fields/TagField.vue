<script setup lang="ts">
import { computed } from 'vue'
import { useRegistrationFormField } from '../useRegistrationForm'
import Errors from './Errors.vue'

type Props = {
  index: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove'): void
}>()

const path = computed(() => `tags.${props.index}.label` as const)
const { value, blur, focus } = useRegistrationFormField(path)
</script>

<template>
  <div class="form-field">
    <label :for="path">Tag #{{ index + 1 }}</label>
    <div class="with-button">
      <input v-model="value" type="text" @focus="focus" @blur="blur" />
      <button class="discrete-button" type="button" @click="() => emit('remove')">✕</button>
    </div>
    <Errors :path="path" />
  </div>
</template>

<style scoped>
.with-button {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
