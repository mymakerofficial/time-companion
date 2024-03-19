import { createColumnHelper, type Row } from '@tanstack/vue-table'
import { isNull } from '@renderer/lib/utils'
import { ChevronsDownUp, ChevronsUpDown, Pencil } from 'lucide-vue-next'
import { Button } from '@renderer/components/ui/button'
import type { ProjectRow } from '@renderer/components/settings/projects/table/types'
import {
  type DataUpdater,
  defineEditableTableCell,
  defineTableCell,
  getSortableHeader,
  getToggleExpandHeader,
} from '@renderer/lib/helpers/tableHelpers'
import { useI18n } from 'vue-i18n'
import { formatDateTime, withFormat } from '@renderer/lib/neoTime'
import BillableSelectBadge from '@renderer/components/common/inputs/billableSelectBadge/BillableSelectBadge.vue'
import { h } from 'vue'
import ColorSelectBadge from '@renderer/components/common/inputs/colorSelectBadge/ColorSelectBadge.vue'
import EditableShadowBadge from '@renderer/components/common/shadow/EditableShadowBadge.vue'

const getNameCell = defineTableCell<ProjectRow, 'shadow'>((value) => {
  return (
    <EditableShadowBadge
      shadow={value}
      variant='skeleton'
      size='md'
      class='font-medium'
    />
  )
})

const getColorCell = defineEditableTableCell<ProjectRow, 'color'>(
  (value, updateValue) => {
    return h(ColorSelectBadge, {
      modelValue: value,
      'onUpdate:modelValue': updateValue,
    })
  },
)

const getBillableCell = defineEditableTableCell<ProjectRow, 'isBillable'>(
  (value, updateValue) => {
    if (isNull(value)) {
      return null
    }

    return h(BillableSelectBadge, {
      modelValue: value,
      'onUpdate:modelValue': updateValue,
    })
  },
)

const getLastUsedCell = defineTableCell<ProjectRow, 'lastUsed'>((value) => {
  if (isNull(value)) {
    return null
  }

  // TODO i18n
  const label = formatDateTime(value, withFormat('dd/MM/yyyy'))

  return <span class='text-muted-foreground text-xs font-medium'>{label}</span>
})

function getActionsCell(row: Row<ProjectRow>, options: ProjectColumnsOptions) {
  const ExpandIcon = row.getIsExpanded() ? ChevronsDownUp : ChevronsUpDown
  const expandButton = row.getCanExpand() && (
    <Button onClick={() => row.toggleExpanded()} variant='ghost' size='icon'>
      <ExpandIcon class='size-4' />
    </Button>
  )

  function handleClick() {
    if (row.original.isProject) {
      options.onOpenEditProjectDialog(row.original.id)
    } else {
      options.onOpenEditActivityDialog(row.original.id)
    }
  }
  const editButton = (
    <Button onClick={handleClick} variant='ghost' size='icon'>
      <Pencil class='size-4' />
    </Button>
  )

  return (
    <span class='flex justify-end gap-1 items-center'>
      {expandButton}
      {editButton}
    </span>
  )
}

const columnHelper = createColumnHelper<ProjectRow>()

interface ProjectColumnsOptions {
  updateData: DataUpdater<ProjectRow>
  onOpenEditProjectDialog: (id: string) => void
  onOpenEditActivityDialog: (id: string) => void
}

export function createProjectsColumns(options: ProjectColumnsOptions) {
  const { updateData } = options
  const { t } = useI18n()

  return [
    columnHelper.accessor('shadow', {
      header: ({ column }) =>
        getSortableHeader(column, t('settings.projects.table.columns.name')),
      cell: (context) => getNameCell(context),
    }),
    columnHelper.accessor('color', {
      header: ({ column }) =>
        getSortableHeader(column, t('settings.projects.table.columns.color')),
      cell: (context) => getColorCell(context, updateData),
    }),
    columnHelper.accessor('isBillable', {
      header: ({ column }) =>
        getSortableHeader(
          column,
          t('settings.projects.table.columns.isBillable'),
        ),
      cell: (context) => getBillableCell(context, updateData),
    }),
    columnHelper.accessor('lastUsed', {
      header: ({ column }) =>
        getSortableHeader(
          column,
          t('settings.projects.table.columns.lastUsed'),
        ),
      cell: (context) => getLastUsedCell(context),
    }),
    columnHelper.display({
      id: 'actions',
      header: ({ table }) => getToggleExpandHeader(table),
      cell: ({ row }) => getActionsCell(row, options),
      meta: {
        className: 'w-0',
      },
    }),
  ]
}
