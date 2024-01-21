<script setup lang="ts">
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
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
      <DialogHeader v-if="isDefined(title)">
        <DialogTitle v-if="isDefined(title)">{{ title }}</DialogTitle>
        <DialogDescription v-if="isDefined(description)">{{ description }}</DialogDescription>
      </DialogHeader>
      <slot />
    </DialogContent>
  </Dialog>
</template>