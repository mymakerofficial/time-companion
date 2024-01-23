<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {isDefined} from "@/lib/utils";

const open = defineModel<boolean>('open', { required: true })

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader v-if="isDefined(title)" class="mb-4">
        <DialogTitle v-if="isDefined(title)">{{ title }}</DialogTitle>
        <DialogDescription v-if="isDefined(description)">{{ description }}</DialogDescription>
      </DialogHeader>
      <slot />
      <div class="mt-1.5">
        <slot name="footer" />
      </div>
    </DialogContent>
  </Dialog>
</template>