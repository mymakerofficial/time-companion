<script setup lang="ts">
import { useDialogState } from '@renderer/composables/dialog/useDialog'
import DialogContextProvider from '@renderer/components/common/dialog/DialogContextProvider.vue'

const { dialogs } = useDialogState()
</script>

<template>
  <template v-for="[id, node] in dialogs" :key="id">
    <DialogContextProvider :id="id">
      <Component :is="node" />
    </DialogContextProvider>
  </template>
</template>
