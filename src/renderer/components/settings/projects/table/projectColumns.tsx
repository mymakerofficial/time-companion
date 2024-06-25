import { createColumnHelper, type Row } from '@tanstack/vue-table'
import { Pencil } from 'lucide-vue-next'
import { Button } from '@shadcn/button'
import {
  type DataUpdater,
  defineEditableTableCell,
} from '@renderer/lib/helpers/tableHelpers'
import { useI18n } from 'vue-i18n'
import BillableSelectBadge from '@renderer/components/common/inputs/billableSelectBadge/BillableSelectBadge.vue'
import { h } from 'vue'
import ColorSelectBadge from '@renderer/components/common/inputs/colorSelectBadge/ColorSelectBadge.vue'
import type { ProjectDto } from '@shared/model/project'
import InplaceInput from '@renderer/components/common/inputs/inplaceInput/InplaceInput.vue'

const getNameCell = defineEditableTableCell<ProjectDto, 'displayName'>(
  (value, updateValue) => {
    return h(InplaceInput, {
      modelValue: value,
      'onUpdate:modelValue': updateValue,
    })
  },
)

const getColorCell = defineEditableTableCell<ProjectDto, 'color'>(
  (value, updateValue) => {
    return h(ColorSelectBadge, {
      modelValue: value,
      'onUpdate:modelValue': updateValue,
    })
  },
)

const getBillableCell = defineEditableTableCell<ProjectDto, 'isBillable'>(
  (value, updateValue) => {
    return h(BillableSelectBadge, {
      modelValue: value,
      'onUpdate:modelValue': updateValue,
    })
  },
)

function getActionsCell(row: Row<ProjectDto>, options: ProjectColumnsOptions) {
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

const columnHelper = createColumnHelper<ProjectDto>()

interface ProjectColumnsOptions {
  updateData: DataUpdater<ProjectDto>
  onEdit: (id: string) => void
}

export function createProjectColumns(options: ProjectColumnsOptions) {
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
    columnHelper.accessor('isBillable', {
      header: t('settings.projects.table.columns.isBillable'),
      cell: (context) => getBillableCell(context, updateData),
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
