<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-muted-foreground mb-2">{{ title }}</h3>
    <slot />
  </div>
</template>
