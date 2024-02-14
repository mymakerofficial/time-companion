import {getSortableHeader} from "@/helpers/table/tableHelpers";
import {createColumnHelper, type Row} from "@tanstack/vue-table";
import type {DayTimeReport} from "@/lib/timeReport/calculateTimeReport";
import {useProjectsStore} from "@/stores/projectsStore";
import {useI18n} from "vue-i18n";
import type {ReactiveProject} from "@/model/project/";
import {Minus} from "lucide-vue-next";
import {formatDate, formatDuration, withFormat} from "@/lib/neoTime";

function getDateCell(value: DayTimeReport['date']) {
  // TODO i18n
  const text = formatDate(value, withFormat('eeee, dd'))

  // TODO find a better way to do this
  if (['Saturday', 'Sunday'].includes(formatDate(value, withFormat('eeee')))) {
    return <span class="text-muted-foreground">{ text }</span>
  } else {
    return text
  }
}

function getProjectCell(row: Row<DayTimeReport>, project: ReactiveProject) {
  const value = row.original.entries.find((it) => it.project.id === project.id)?.duration ?? 0

  if (value === 0) {
    return <span class="text-muted-foreground"><Minus class="size-3" /></span>
  } else {
    // TODO humanize
    return formatDuration(value)
  }
}

function getTotalCell(value: DayTimeReport['totalBillableDuration']) {
  if (value === 0) {
    return <span class="text-muted-foreground"><Minus class="size-3" /></span>
  } else {
    // TODO humanize
    return formatDuration(value)
  }
}

const columnHelper = createColumnHelper<DayTimeReport>()

export function createReportColumns() {
  const { t } = useI18n()
  const projectsStore = useProjectsStore()

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
    columnHelper.accessor('totalBillableDuration', {
      header: () => t('report.table.columns.totalDuration'),
      cell: (info) => getTotalCell(info.getValue()),
      enableHiding: false,
      meta: {
        className: 'border-l font-medium',
      },
    }),
  ]
}