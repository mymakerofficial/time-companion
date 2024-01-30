<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="mb-16">
    <div class="mb-8 space-y-1">
      <h2 class="text-lg font-semibold text-primary tracking-tight">{{ title }}</h2>
      <p v-if="description" class="text-xs text-muted-foreground ">{{ description }}</p>
    </div>
    <slot />
  </section>
</template>