<script setup lang="tsx">
import {useProjectsStore} from "@/stores/projectsStore";
import {ref} from "vue";
import ResponsiveContainer from "@/components/common/layout/ResponsiveContainer.vue";
import TableActions from "@/components/common/table/TableActions.vue";
import {
  getSortedRowModel,
  type SortingState,
  type TableOptions, type VisibilityState
} from "@tanstack/vue-table";
import Table from "@/components/common/table/Table.vue";
import {updater} from "@/helpers/table/tableHelpers";
import TableVisibilitySelect from "@/components/common/table/TableVisibilitySelect.vue";
import {type DayTimeReport, calculateTimeReport, createTimeReport} from "@/lib/timeReport/calculateTimeReport";
import {useCalendarStore} from "@/stores/calendarStore";
import {isNotEmpty, whereDate} from "@/lib/listUtils";
import {Button} from "@/components/ui/button";
import {useOpenDialog} from "@/composables/useOpenDialog";
import NewProjectDialog from "@/components/settings/projects/projectDialog/NewProjectDialog.vue";
import {isNull} from "@/lib/utils";
import {createReportColumns} from "@/components/report/reportColumns";
import {daysInMonth, formatDate, today, withFormat} from "@/lib/neoTime";

const calendarStore = useCalendarStore()
const projectsStore = useProjectsStore()

const monthLabel = formatDate(today(), withFormat('MMMM'))
const yearLabel = formatDate(today(), withFormat('YYYY'))

const dates = daysInMonth(today())

const data = dates.map((date) => {
  const day = calendarStore.days.find(whereDate(date)) ?? null

  if (isNull(day)) {
    return createTimeReport({
      date
    })
  }

  return calculateTimeReport(day, projectsStore.projects)
})

const columns = createReportColumns()

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
  <ResponsiveContainer class="my-16">
    <template v-if="isNotEmpty(projectsStore.projects)">
      <Table :data="data" :columns="columns" :options="tableOptions" class="[&_tbody_>_tr:nth-child(odd)]:bg-muted/20 [&_tbody_>_tr:nth-child(odd):hover]:bg-muted/60">
        <template #actions="{ table }">
          <TableActions>
            <template #left>
              <h1 class="text-2xl tracking-tight space-x-2"><span class="font-bold">{{ monthLabel }}</span><span>{{ yearLabel }}</span></h1>
            </template>
            <template #right>
              <TableVisibilitySelect :table="table" :label="$t('project.title', 2)" />
            </template>
          </TableActions>
        </template>
      </Table>
    </template>
    <template v-else>
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl tracking-tight font-medium">{{ $t('report.empty.noProjects.title') }}</h1>
        <p class="text-muted-foreground">
          <i18n-t keypath="report.empty.noProjects.description.term">
            <Button @click="useOpenDialog(NewProjectDialog)" variant="link" class="p-0">{{ $t('report.empty.noProjects.description.createProject') }}</Button>
          </i18n-t>
        </p>
      </div>
    </template>
  </ResponsiveContainer>
</template>
