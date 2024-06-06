<script setup lang="ts">
import Table from '@renderer/components/common/table/Table.vue'
import { Button } from '@renderer/components/ui/button'
import { Plus } from 'lucide-vue-next'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import { useGetTasks } from '@renderer/composables/queries/tasks/useGetTasks'
import { createTaskColumns } from '@renderer/components/settings/tasks/table/taskColumns'
import CreateTaskDialog from '@renderer/components/settings/tasks/dialog/CreateTaskDialog.vue'
import { useDialog } from '@renderer/composables/dialog/useDialog'

const { data: tasks } = useGetTasks()
const { open: openCreateTask } = useDialog(CreateTaskDialog)

const columns = createTaskColumns({
  updateData: (original, columnAccessor, value) => {
    // ...
  },
  onEdit: (id) => {
    // ...
  },
})
</script>

<template>
  <TableActions>
    <Button @click="openCreateTask" size="sm" class="gap-2">
      <Plus class="size-4" />
      <span>Add Task</span>
    </Button>
  </TableActions>
  <Table :data="tasks" :columns="columns" />
</template>
