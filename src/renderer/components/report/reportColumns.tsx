import {getSortableHeader} from "@renderer/lib/helpers/tableHelpers";
import {createColumnHelper, type Row} from "@tanstack/vue-table";
import {useI18n} from "vue-i18n";
import type {ReactiveProject} from "@renderer/model/project/types";
import {Minus} from "lucide-vue-next";
import {durationZero, formatDate, humanizeDuration, isZeroDuration, withFormat} from "@renderer/lib/neoTime";
import {useProjectsService} from "@renderer/services/projectsService";
import type {DayTimeReport} from "@renderer/lib/timeReport/types";

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
  const duration = row.original.entries
    .find((it) => it.project.id === project.id)
    ?.duration ?? durationZero()

  if (isZeroDuration(duration)) {
    return <span class="text-muted-foreground"><Minus class="size-3" /></span>
  } else {
    return humanizeDuration(duration)
  }
}

function getTotalCell(duration: DayTimeReport['totalBillableDuration']) {
  if (isZeroDuration(duration)) {
    return <span class="text-muted-foreground"><Minus class="size-3" /></span>
  } else {
    return humanizeDuration(duration)
  }
}

const columnHelper = createColumnHelper<DayTimeReport>()

export function createReportColumns() {
  const { t } = useI18n()
  const projectsService = useProjectsService()

  return [
    columnHelper.accessor('date', {
      header: ({ column }) => getSortableHeader(column, t('report.table.columns.date')),
      cell: (info) => getDateCell(info.getValue()),
      enableHiding: false,
      meta: {
        className: 'border-r font-medium',
      },
    }),
    ...projectsService.projects.map((project) => columnHelper.display({
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