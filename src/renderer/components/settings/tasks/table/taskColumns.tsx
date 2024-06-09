import {
  type DataUpdater,
  defineEditableTableCell,
} from '@renderer/lib/helpers/tableHelpers'
import { h } from 'vue'
import InplaceInput from '@renderer/components/common/inputs/inplaceInput/InplaceInput.vue'
import ColorSelectBadge from '@renderer/components/common/inputs/colorSelectBadge/ColorSelectBadge.vue'
import { createColumnHelper, type Row } from '@tanstack/vue-table'
import { Button } from '@renderer/components/ui/button'
import { Pencil } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { TaskDto } from '@shared/model/task'

const getNameCell = defineEditableTableCell<TaskDto, 'displayName'>(
  (value, updateValue) => {
    return h(InplaceInput, {
      modelValue: value,
      'onUpdate:modelValue': updateValue,
    })
  },
)

const getColorCell = defineEditableTableCell<TaskDto, 'color'>(
  (value, updateValue) => {
    return h(ColorSelectBadge, {
      modelValue: value,
      'onUpdate:modelValue': updateValue,
    })
  },
)

function getActionsCell(row: Row<TaskDto>, options: TaskColumnsOptions) {
  function handleClick() {
    options.onEdit(row.original.id)
  }

  return (
    <span class='flex justify-end gap-1 items-center'>
      <Button onClick={handleClick} variant='ghost' size='icon'>
        <Pencil class='size-4' />
      </Button>
    </span>
  )
}

const columnHelper = createColumnHelper<TaskDto>()

interface TaskColumnsOptions {
  updateData: DataUpdater<TaskDto>
  onEdit: (id: string) => void
}

export function createTaskColumns(options: TaskColumnsOptions) {
  const { updateData } = options
  const { t } = useI18n()

  return [
    columnHelper.accessor('displayName', {
      header: t('settings.projects.table.columns.name'),
      cell: (context) => getNameCell(context, updateData),
    }),
    columnHelper.accessor('color', {
      header: t('settings.projects.table.columns.color'),
      cell: (context) => getColorCell(context, updateData),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => getActionsCell(row, options),
      meta: {
        className: 'w-0',
      },
    }),
  ]
}
