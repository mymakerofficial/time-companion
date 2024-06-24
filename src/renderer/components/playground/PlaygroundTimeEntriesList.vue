<script setup lang="ts">
import { useGetTimeEntriesByDay } from '@renderer/composables/queries/timeEntries/useTimeEntriesByDay'
import Table from '@renderer/components/common/table/Table.vue'
import { createColumnHelper } from '@tanstack/vue-table'
import { h, markRaw } from 'vue'
import type { TimeEntryDto } from '@shared/model/timeEntry'
import PlaygroundProjectBadge from '@renderer/components/playground/PlaygroundProjectBadge.vue'
import { isNull } from '@shared/lib/utils/checks'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import { Pen } from 'lucide-vue-next'
import { Button } from '@renderer/components/ui/button'
import { useDialog } from '@renderer/composables/dialog/useDialog'
import DayEditorSidebar from '@renderer/components/common/dayEditor/DayEditorSidebar.vue'

const props = defineProps<{
  dayId: string
}>()

const { open: openEditor } = useDialog(DayEditorSidebar)
const { data: timeEntries } = useGetTimeEntriesByDay(props.dayId)

const columnHelper = createColumnHelper<TimeEntryDto>()
const columns = markRaw([
  columnHelper.accessor('projectId', {
    header: 'project',
    cell: ({ getValue }) => {
      const value = getValue()
      if (isNull(value)) {
        return ''
      }
      return h(PlaygroundProjectBadge, { projectId: value })
    },
  }),
  columnHelper.accessor('description', {
    header: 'description',
    cell: (context) => context.getValue(),
  }),
  columnHelper.accessor('startedAt', {
    header: 'startedAt',
    cell: (context) => context.getValue().toLocaleString(),
  }),
  columnHelper.accessor('stoppedAt', {
    header: 'stoppedAt',
    cell: (context) => context.getValue()?.toLocaleString() ?? 'null',
  }),
])

function handleEdit() {
  openEditor({ dayId: props.dayId })
}
</script>

<template>
  <TableActions>
    <Button @click="handleEdit" size="sm" class="gap-2">
      <Pen class="size-4" />
      <span>Edit Day</span>
    </Button>
  </TableActions>
  <Table :data="timeEntries" :columns="columns" />
</template>
