<script setup lang="ts">
const model = defineModel<string>({ required: true })

const emit = defineEmits<{
  change: [value: string]
}>()

function handleInput(event: Event) {
  // @ts-ignore
  model.value = event.target.outerText ?? ''
}

function handleBlur() {
  emit('change', model.value)
}

function handleEnter() {
  emit('change', model.value)
}
</script>

<template>
  <span
    role="textbox"
    contenteditable
    v-text="model"
    @input="handleInput"
    @blur="handleBlur"
    @keydown.enter="handleEnter"
  />
</template>
