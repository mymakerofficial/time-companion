<script setup lang="ts">
import {Separator} from "@/components/ui/separator"

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="mb-8 flex flex-col gap-8">
    <div class="space-y-1">
      <h2 class="text-sm font-medium text-primary tracking-tight">{{ title }}</h2>
      <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <div>
      <slot />
    </div>
    <Separator />
  </section>
</template>