<script setup lang="ts">
import { useRegistrationFormField } from './useRegistrationForm'
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
  <div>
    <h4>Tags</h4>
    <TagField v-for="(tag, index) in value" :key="tag.id" :index="index" @remove="() => removeTagAt(index)" />
    <button type="button" @click="addTag">Add</button>
  </div>
</template>
