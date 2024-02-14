import {getSortableHeader} from "@/helpers/table/tableHelpers";
import {formatDate, formatMinutes} from "@/lib/timeUtils";
import {createColumnHelper, type Row} from "@tanstack/vue-table";
import type {DayTimeReport} from "@/lib/timeReport/calculateTimeReport";
import {useProjectsStore} from "@/stores/projectsStore";
import {useI18n} from "vue-i18n";
import type {ReactiveProject} from "@/model/project/";
import {Minus} from "lucide-vue-next";

const projectsStore = useProjectsStore()

function getDateCell(value: DayTimeReport['date']) {
  const text = formatDate(value, 'dd, DD')

  if (['Saturday', 'Sunday'].includes(formatDate(value, 'dddd'))) {
    return <span class="text-muted-foreground">{ text }</span>
  } else {
    return text
  }
}

function getProjectCell(row: Row<DayTimeReport>, project: ReactiveProject) {
  const value = row.original.entries.find((it) => it.project.id === project.id)?.timeMinutes ?? 0

  if (value === 0) {
    return <span class="text-muted-foreground"><Minus class="size-3" /></span>
  } else {
    return formatMinutes(value)
  }
}

function getTotalBillableTimeMinutesCell(value: DayTimeReport['totalBillableTimeMinutes']) {
  if (value === 0) {
    return <span class="text-muted-foreground"><Minus class="size-3" /></span>
  } else {
    return formatMinutes(value)
  }
}

const columnHelper = createColumnHelper<DayTimeReport>()

export function createReportColumns() {
  const { t } = useI18n()

  return [
    columnHelper.accessor('date', {
      header: ({ column }) => getSortableHeader(column, t('report.table.columns.date')),
      cell: (info) => getDateCell(info.getValue()),
      enableHiding: false,
      meta: {
        className: 'border-r font-medium',
      },
    }),
    ...projectsStore.projects.map((project) => columnHelper.display({
      id: project.id,
      header: () => project.displayName,
      cell: ({ row }) => getProjectCell(row, project),
    })),
    columnHelper.accessor('totalBillableTimeMinutes', {
      header: () => t('report.table.columns.totalDuration'),
      cell: (info) => getTotalBillableTimeMinutesCell(info.getValue()),
      enableHiding: false,
      meta: {
        className: 'border-l font-medium',
      },
    }),
  ]
}