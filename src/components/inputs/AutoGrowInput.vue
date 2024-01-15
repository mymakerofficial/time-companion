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
    @input="handleInput"
    style="{ 'text-wrap': 'pre' }"
  >{{model}}<b /></span>
</template>