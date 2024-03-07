<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="mb-16 space-y-2">
    <h3 class="text-3xl font-bold tracking-tight">{{ title }}</h3>
  </section>
</template>