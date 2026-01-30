<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useRegistrationFormField } from './useRegistrationForm'
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
  <div>
    <label>
      Tag #{{ index + 1 }}
      <input v-model="value" type="text" @focus="focus" @blur="blur" />
      <Errors :path="path" />
    </label>
    <button type="button" @click="() => emit('remove')">Remove</button>
  </div>
</template>
