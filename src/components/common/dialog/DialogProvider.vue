<script setup lang="ts">
import {useDialogStore} from "@/stores/dialogStore";
import type {VNode} from "@vue/runtime-dom";

const dialogStore = useDialogStore()

function handleClose(dialog: VNode) {
  setTimeout(() => {
    dialogStore.closeDialog(dialog)
  }, 200);
}
</script>

<template>
  <template v-for="(dialog, index) in dialogStore.dialogs" :key="index">
    <Component :is="dialog" @close="() => handleClose(dialog)"  />
  </template>
</template>
