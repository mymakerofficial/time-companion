<script setup lang="ts">
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
import type {ProjectRow} from "@/components/settings/projects/table/types";
import TableVisibilitySelect from "@/components/common/table/TableVisibilitySelect.vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n()

const projectsStore = useProjectsStore();

type Column = {
  [key: string]: object
}

const columnHelper = createColumnHelper<Column>()

const columns = computed(() => [
  columnHelper.accessor('date', {
    header: ({ column }) => getSortableHeader(column, t('report.table.columns.date')),
    cell: () => 0,
    enableHiding: false,
  }),
  ...projectsStore.projects.map((project) => columnHelper.display({
    id: `project-${project.id}`,
    header: () => project.displayName,
    cell: () => 0,
  })),
  columnHelper.accessor('total', {
    header: () => t('report.table.columns.totalDuration'),
    cell: () => 0,
    enableHiding: false,
  }),
])

const data = ref<Column[]>([])

const sorting = ref<SortingState>([])
const columnVisibility = ref<VisibilityState>({})

const tableOptions: Partial<TableOptions<Column>> = {
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
    <Table :data="data" :columns="columns" :options="tableOptions">
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
