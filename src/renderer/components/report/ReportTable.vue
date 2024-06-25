<script setup lang="tsx">
import { computed, markRaw, ref } from 'vue'
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import {
  getSortedRowModel,
  type SortingState,
  type TableOptions,
  type VisibilityState,
} from '@tanstack/vue-table'
import Table from '@renderer/components/common/table/Table.vue'
import { updater } from '@renderer/lib/helpers/tableHelpers'
import TableVisibilitySelect from '@renderer/components/common/table/TableVisibilitySelect.vue'
import { useReportColumns } from '@renderer/components/report/reportColumns'
import { currentMonth, minutes } from '@renderer/lib/neoTime'
import { useTimeReportService } from '@renderer/services/timeReportService'
import type { DayTimeReport } from '@renderer/lib/timeReport/types'
import { useNow } from '@renderer/composables/useNow'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { useFormattedDateTime } from '@renderer/composables/datetime/useFormattedDateTime'
import { useGetProjects } from '@renderer/composables/queries/projects/useGetProjects'
import { isNotEmpty } from '@shared/lib/utils/checks'
import CreateProjectDialog from '@renderer/components/settings/projects/dialog/CreateProjectDialog.vue'
import { useDialog } from '@renderer/composables/dialog/useDialog'
import { Button } from '@shadcn/button'

const timeReportService = useTimeReportService()

const today = markRaw(PlainDate.now())
const monthLabel = useFormattedDateTime(today, {
  month: 'long',
})
const yearLabel = useFormattedDateTime(today, {
  year: 'numeric',
})

const now = useNow({
  interval: minutes(),
})

const data = computed(() =>
  timeReportService.getMonthTimeReport(currentMonth(), {
    endAtFallback: now.value,
  }),
)

const { open: openCreateProject } = useDialog(CreateProjectDialog)
const { data: projects, isPending: projectsIsPending } = useGetProjects()

const columns = useReportColumns(projects)

const sorting = ref<SortingState>([])
const columnVisibility = ref<VisibilityState>({})

const tableOptions: Partial<TableOptions<DayTimeReport>> = {
  state: {
    get sorting() {
      return sorting.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
  },
  onSortingChange: (updaterOrValue) => updater(updaterOrValue, sorting),
  onColumnVisibilityChange: (updaterOrValue) =>
    updater(updaterOrValue, columnVisibility),
  getSortedRowModel: getSortedRowModel(),
}
</script>

<template>
  <ResponsiveContainer class="my-16">
    <template v-if="isNotEmpty(projects) || projectsIsPending">
      <Table
        :data="data"
        :columns="columns"
        :options="tableOptions"
        class="[&_tbody_>_tr:nth-child(odd)]:bg-muted/20 [&_tbody_>_tr:nth-child(odd):hover]:bg-muted/60"
      >
        <template #actions="{ table }">
          <TableActions>
            <template #left>
              <h1 class="text-2xl tracking-tight space-x-2">
                <span class="font-bold">{{ monthLabel }}</span
                ><span>{{ yearLabel }}</span>
              </h1>
            </template>
            <template #right>
              <TableVisibilitySelect
                :table="table"
                :label="$t('project.title', 2)"
              />
            </template>
          </TableActions>
        </template>
      </Table>
    </template>
    <template v-else>
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl tracking-tight font-medium">
          {{ $t('report.empty.noProjects.title') }}
        </h1>
        <p class="text-muted-foreground">
          <i18n-t keypath="report.empty.noProjects.description.term">
            <Button @click="openCreateProject" variant="link" class="p-0">
              {{ $t('report.empty.noProjects.description.createProject') }}
            </Button>
          </i18n-t>
        </p>
      </div>
    </template>
  </ResponsiveContainer>
</template>
