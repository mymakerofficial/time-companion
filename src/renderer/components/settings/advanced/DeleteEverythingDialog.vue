<script setup lang="ts">
import { useDialogContext } from '@renderer/composables/dialog/useDialog'
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { Button } from '@shadcn/button'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { close, open } = useDialogContext()

function handleDelete() {
  toast.info('wip')
}
</script>

<template>
  <BaseDialog v-model:open="open" title="Delete All Data?">
    <div class="mb-4 flex flex-col gap-4">
      <p class="text-muted-foreground text-sm">
        You are about to delete all your data. Are you sure you want to
        continue?
      </p>
      <p class="text-red-500 font-bold flex gap-2">
        <AlertTriangle />
        <span>THIS ACTION CAN NOT BE UNDONE.</span>
      </p>
    </div>
    <template #footer>
      <div class="flex flex-row justify-between">
        <Button type="button" @click="close"> Cancel </Button>
        <Button variant="destructive" class="gap-2" @click="handleDelete">
          <Trash2 class="size-4" /><span>Delete Everything</span>
        </Button>
      </div>
    </template>
  </BaseDialog>
</template>
