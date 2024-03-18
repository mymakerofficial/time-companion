<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@renderer/components/ui/dialog";
import {isDefined} from "@renderer/lib/utils";

const open = defineModel<boolean>('open', { required: true })

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader v-if="isDefined(title) || $slots.title" class="mb-4">
        <DialogTitle v-if="isDefined(title) || $slots.title" class="flex items-center gap-2"><slot name="title">{{ title }}</slot></DialogTitle>
        <DialogDescription v-if="isDefined(description) || $slots.description"><slot name="description">{{ description }}</slot></DialogDescription>
      </DialogHeader>
      <slot />
      <div class="mt-1.5">
        <slot name="footer" />
      </div>
    </DialogContent>
  </Dialog>
</template>