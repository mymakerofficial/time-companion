import { getSortableHeader } from '@renderer/lib/helpers/tableHelpers'
import { createColumnHelper, type Row } from '@tanstack/vue-table'
import { useI18n } from 'vue-i18n'
import { Minus } from 'lucide-vue-next'
import {
  durationZero,
  formatDate,
  humanizeDuration,
  isZeroDuration,
  withFormat,
} from '@renderer/lib/neoTime'
import type { DayTimeReport } from '@renderer/lib/timeReport/types'
import type { ProjectDto } from '@shared/model/project'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

function getDateCell(value: DayTimeReport['date']) {
  // TODO i18n
  const text = formatDate(value, withFormat('eeee, dd'))

  // TODO find a better way to do this
  if (['Saturday', 'Sunday'].includes(formatDate(value, withFormat('eeee')))) {
    return <span class='text-muted-foreground'>{text}</span>
  } else {
    return text
  }
}

function getProjectCell(row: Row<DayTimeReport>, project: ProjectDto) {
  const duration =
    row.original.entries.find((it) => it.project.id === project.id)?.duration ??
    durationZero()

  if (isZeroDuration(duration)) {
    return (
      <span class='text-muted-foreground'>
        <Minus class='size-3' />
      </span>
    )
  } else {
    return humanizeDuration(duration)
  }
}

function getTotalCell(duration: DayTimeReport['totalBillableDuration']) {
  if (isZeroDuration(duration)) {
    return (
      <span class='text-muted-foreground'>
        <Minus class='size-3' />
      </span>
    )
  } else {
    return humanizeDuration(duration)
  }
}

const columnHelper = createColumnHelper<DayTimeReport>()

export function useReportColumns(
  projects: MaybeRefOrGetter<Array<ProjectDto>>,
) {
  const { t } = useI18n()

  return computed(() => [
    columnHelper.accessor('date', {
      header: ({ column }) =>
        getSortableHeader(column, t('report.table.columns.date')),
      cell: (info) => getDateCell(info.getValue()),
      enableHiding: false,
      meta: {
        className: 'border-r font-medium',
      },
    }),
    ...toValue(projects).map((project) =>
      columnHelper.display({
        id: project.id,
        header: () => project.displayName,
        cell: ({ row }) => getProjectCell(row, project),
      }),
    ),
    columnHelper.accessor('totalBillableDuration', {
      header: () => t('report.table.columns.totalDuration'),
      cell: (info) => getTotalCell(info.getValue()),
      enableHiding: false,
      meta: {
        className: 'border-l font-medium',
      },
    }),
  ])
}
