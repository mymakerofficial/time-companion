<script setup lang="ts">
const model = defineModel({ required: false })
</script>

<template>
  <input v-model="model" />
</template>