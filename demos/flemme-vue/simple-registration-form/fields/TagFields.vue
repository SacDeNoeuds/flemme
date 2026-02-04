<script setup lang="ts">
import { useRegistrationFormField } from '../useRegistrationForm'
import TagField from './TagField.vue'

const { value } = useRegistrationFormField('tags')
function addTag() {
  value.value = value.value.concat({
    id: crypto.randomUUID(),
    label: `New Tag ${value.value.length + 1}`,
  })
}
function removeTagAt(index: number) {
  value.value = value.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="container">
    <div class="with-button">
      <h4>Tags</h4>
      <button class="discrete-button" type="button" @click="addTag">+</button>
    </div>
    <TagField v-for="(tag, index) in value" :key="tag.id" :index="index" @remove="() => removeTagAt(index)" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.with-button {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
