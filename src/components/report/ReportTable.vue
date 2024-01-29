<script setup lang="tsx">
import {useProjectsStore} from "@/stores/projectsStore";
import {computed, ref} from "vue";
import ResponsiveContainer from "@/components/common/layout/ResponsiveContainer.vue";
import TableActions from "@/components/common/table/TableActions.vue";
import {
  createColumnHelper,
  getSortedRowModel,
  type SortingState,
  type TableOptions, type VisibilityState
} from "@tanstack/vue-table";
import Table from "@/components/common/table/Table.vue";
import {getSortableHeader, updater} from "@/helpers/table/tableHelpers";
import TableVisibilitySelect from "@/components/common/table/TableVisibilitySelect.vue";
import {useI18n} from "vue-i18n";
import {formatDate, formatMinutes} from "@/lib/timeUtils";
import {type DayTimeReport, calculateTimeReport} from "@/lib/timeReport/calculateTimeReport";
import {useCalendarStore} from "@/stores/calendarStore";

const { t } = useI18n()

const calendarStore = useCalendarStore()
const projectsStore = useProjectsStore();

const columnHelper = createColumnHelper<DayTimeReport>()

const columns = computed(() => [
  columnHelper.accessor('date', {
    header: ({ column }) => getSortableHeader(column, t('report.table.columns.date')),
    cell: (info) => formatDate(info.getValue(), 'dddd DD.MM.YYYY'),
    enableHiding: false,
    meta: {
      className: 'border-r font-medium',
    },
  }),
  ...projectsStore.projects.map((project) => columnHelper.display({
    id: project.id,
    header: () => project.displayName,
    cell: ({ row }) => formatMinutes(row.original.entries.find((it) => it.project.id === project.id)?.timeMinutes ?? 0),
  })),
  columnHelper.accessor('totalBillableTimeMinutes', {
    header: () => t('report.table.columns.totalDuration'),
    cell: (info) => formatMinutes(info.getValue()),
    enableHiding: false,
    meta: {
      className: 'border-l font-medium',
    },
  }),
])

const data = calendarStore.days.map((day) => calculateTimeReport(day, projectsStore.projects))

const sorting = ref<SortingState>([])
const columnVisibility = ref<VisibilityState>({})

const tableOptions: Partial<TableOptions<DayTimeReport>> = {
  state: {
    get sorting() { return sorting.value },
    get columnVisibility() { return columnVisibility.value },
  },
  onSortingChange: (updaterOrValue) => updater(updaterOrValue, sorting),
  onColumnVisibilityChange: (updaterOrValue) => updater(updaterOrValue, columnVisibility),
  getSortedRowModel: getSortedRowModel(),
}
</script>

<template>
  <ResponsiveContainer class="mt-16">
    <Table :data="data" :columns="columns" :options="tableOptions" class="[&_tbody_>_tr:nth-child(odd)]:bg-muted/20 [&_tbody_>_tr:nth-child(odd):hover]:bg-muted/60">
      <template #actions="{ table }">
        <TableActions>
          <div>
            <TableVisibilitySelect :table="table" :label="$t('project.title', 2)" />
          </div>
        </TableActions>
      </template>
    </Table>
  </ResponsiveContainer>
</template>
