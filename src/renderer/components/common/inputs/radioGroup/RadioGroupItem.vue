<script setup lang="ts">
defineProps<{
  label: string
  active: boolean
}>()
</script>

<template>
  <button
    :aria-checked="active"
    :data-active="active"
    role="radio"
    class="group h-12 px-4 bg-secondary/50 data-[active=true]:bg-secondary rounded-md flex items-center gap-3"
  >
    <span
      class="size-4 rounded-full border group-data-[active=true]:border-4 border-primary/50"
    />
    <span class="font-medium text-sm">{{ label }}</span>
  </button>
</template>
