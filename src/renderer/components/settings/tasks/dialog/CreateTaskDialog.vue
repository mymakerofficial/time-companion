<script setup lang="ts">
import BaseDialog from '@renderer/components/common/dialog/BaseDialog.vue'
import { ref } from 'vue'
import { Button } from '@renderer/components/ui/button'
import { useCreateTask } from '@renderer/composables/mutations/tasks/useCreateTask'
import type { TaskDto } from '@shared/model/task'
import TaskForm from '@renderer/components/settings/tasks/dialog/TaskForm.vue'

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const { mutate: createTask } = useCreateTask()

function handleSubmit(values: TaskDto) {
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
