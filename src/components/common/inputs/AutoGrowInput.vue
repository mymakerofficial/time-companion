<script setup lang="ts">
const model = defineModel<string>({ required: true })

function handleInput(event: Event) {
  // @ts-ignore
  model.value = event.target.outerText ?? ''
}
</script>

<template>
  <span
    role="textbox"
    contenteditable
    v-text="model"
    @input="handleInput"
  />
</template>