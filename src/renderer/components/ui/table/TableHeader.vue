<script setup lang="ts">
import { cn } from '@renderer/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <thead :class="cn('[&_tr]:border-b', props.class)">
    <slot />
  </thead>
</template>
