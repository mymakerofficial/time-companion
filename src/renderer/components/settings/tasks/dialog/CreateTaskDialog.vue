<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { Button } from '@renderer/components/ui/button'
import { useCreateTask } from '@renderer/composables/mutations/tasks/useCreateTask'
import type { CreateTask } from '@shared/model/task'
import TaskForm from '@renderer/components/settings/tasks/dialog/TaskForm.vue'
import { useDialogContext } from '@renderer/composables/dialog/useDialog'

const { close, open } = useDialogContext()
const { mutate: createTask } = useCreateTask()

function handleSubmit(values: CreateTask) {
  createTask(values, {
    onSuccess: close,
  })
}
</script>

<template>
  <BaseDialog v-model:open="open" title="New Task" description="taskie task">
    <TaskForm @submit="handleSubmit" #actions>
      <Button type="button" @click="close()" variant="ghost">
        {{ $t('dialog.project.controls.cancel') }}
      </Button>
      <Button type="submit">
        {{ $t('dialog.project.controls.create') }}
      </Button>
    </TaskForm>
    <template #footer>
      <!-- TODO: put actions in footer -->
    </template>
  </BaseDialog>
</template>
