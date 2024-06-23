<script setup lang="ts">
import { useGetTimeEntriesByDay } from '@renderer/composables/queries/timeEntries/useTimeEntriesByDay'
import Table from '@renderer/components/common/table/Table.vue'
import { createColumnHelper } from '@tanstack/vue-table'
import { h, markRaw } from 'vue'
import type { TimeEntryDto } from '@shared/model/timeEntry'
import PlaygroundProjectBadge from '@renderer/components/playground/PlaygroundProjectBadge.vue'
import { isNull } from '@shared/lib/utils/checks'

const props = defineProps<{
  dayId: string
}>()

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
</script>

<template>
  <Table :data="timeEntries" :columns="columns" />
</template>
