import { defineStore } from 'pinia'
import { reactive, readonly } from 'vue'
import type { VNode } from '@vue/runtime-dom'

interface DialogStore {
  readonly dialogs: VNode[]
  openDialog: (dialog: VNode) => void
  closeDialog: (dialog: VNode) => void
}

export const useDialogStore = defineStore('dialog', () => {
  const dialogs = reactive<VNode[]>([])

  function openDialog(dialog: VNode) {
    dialogs.push(dialog)
  }

  function closeDialog(dialog: VNode) {
    const index = dialogs.indexOf(dialog)

    if (index === -1) {
      throw new Error('Failed to close provided dialog')
    }

    dialogs.splice(index, 1)
  }

  return {
    dialogs: readonly(dialogs),
    openDialog,
    closeDialog,
  }
})
