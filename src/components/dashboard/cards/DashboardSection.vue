<script setup lang="ts">
import {isNotEmpty} from "@/lib/listUtils";

defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="p-6 flex flex-col gap-4 border-b border-border">
    <h2 v-if="isNotEmpty(label)" class="text-sm font-medium ml-4">{{ label }}</h2>
    <slot />
  </div>
</template>