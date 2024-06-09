<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { Button } from '@renderer/components/ui/button'
import type { UpdateTask } from '@shared/model/task'
import TaskForm from '@renderer/components/settings/tasks/dialog/TaskForm.vue'
import { useDialogContext } from '@renderer/composables/dialog/useDialog'
import { useGetTaskById } from '@renderer/composables/queries/tasks/useGetTaskById'
import { usePatchTaskById } from '@renderer/composables/mutations/tasks/usePatchTaskById'
import { useSoftDeleteTask } from '@renderer/composables/mutations/tasks/useSoftDeleteTask'

const props = defineProps<{
  id: string
}>()

const { close, open } = useDialogContext()
const { data: task, isPending, isError, error } = useGetTaskById(props.id)
const { mutate: patchTask } = usePatchTaskById()
const { mutate: deleteTask } = useSoftDeleteTask()

function handleSubmit(task: UpdateTask) {
  patchTask(
    {
      id: props.id,
      task,
    },
    {
      onSuccess: close,
    },
  )
}

function handleDelete() {
  deleteTask(props.id, {
    onSuccess: close,
  })
}
</script>

<template>
  <BaseDialog v-model:open="open" title="New Task" description="taskie task">
    <div v-if="isPending">Loading...</div>
    <div v-else-if="isError">Error: {{ error }}</div>
    <TaskForm v-else-if="task" :task="task" @submit="handleSubmit" #actions>
      <Button
        type="button"
        @click="handleDelete"
        variant="destructive"
        class="mr-auto"
      >
        {{ $t('dialog.project.controls.delete') }}
      </Button>
      <Button type="button" @click="close" variant="ghost">
        {{ $t('dialog.project.controls.cancel') }}
      </Button>
      <Button type="submit">
        {{ $t('dialog.project.controls.save') }}
      </Button>
    </TaskForm>
    <template #footer>
      <!-- TODO: put actions in footer -->
    </template>
  </BaseDialog>
</template>
