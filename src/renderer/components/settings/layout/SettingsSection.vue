<script setup lang="ts">
import { Separator } from '@shadcn/separator'

defineProps<{
  title?: string
  description?: string
}>()

defineSlots<{
  action: void
  default: void
}>()
</script>

<template>
  <section class="mb-8 flex flex-col gap-8">
    <div class="flex gap-4 justify-between">
      <div class="space-y-1">
        <h2
          v-if="title"
          class="text-sm font-medium text-primary tracking-tight"
        >
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.action" class="mx-6 flex items-center">
        <slot name="action" />
      </div>
    </div>
    <div v-if="$slots.default" class="flex flex-col gap-8">
      <slot />
    </div>
    <Separator />
  </section>
</template>
