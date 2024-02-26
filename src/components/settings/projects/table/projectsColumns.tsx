import {createColumnHelper, type Row} from "@tanstack/vue-table";
import {isNull} from "@/lib/utils";
import {
  ChevronsDownUp,
  ChevronsUpDown, Coffee, Coins, Paintbrush,
  Pencil
} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import {getSortableHeader} from "@/lib/helpers/tableHelpers";
import {useI18n} from "vue-i18n";
import {Badge} from "@/components/ui/badge";
import ShadowBadge from "@/components/common/shadow/ShadowBadge.vue";
import {formatDateTime, withFormat} from "@/lib/neoTime";

function getNameCell(value: ProjectRow['shadow']) {
  return <ShadowBadge shadow={value} variant="skeleton" size="md" class="font-medium" />
}

function getColorCell(value: ProjectRow['color']) {
  if (isNull(value)) {
    return null
  }

  const { t } = useI18n()

  const label = t(`common.colors.${value}`)

  return <Badge color={value} variant="ghost"><Paintbrush class="size-3" />{label}</Badge>
}

function getBillableCell(value: ProjectRow['isBillable']) {
  if (isNull(value)) {
    return null
  }

  const { t } = useI18n()

  const color = value ? 'green' : 'rose'
  const label = value ? t(`common.labels.yes`) : t(`common.labels.no`)

  const Icon = value ? Coins : Coffee

  return <Badge color={color} variant="ghost"><Icon class="size-3" />{label}</Badge>
}

function getLastUsedCell(value: ProjectRow['lastUsed']) {
  if (isNull(value)) {
    return null
  }

  // TODO i18n
  return formatDateTime(value, withFormat('dd/MM/yyyy HH:mm'))
}

function getActionsCell(row: Row<ProjectRow>, options: ProjectColumnsOptions) {
  const ExpandIcon = row.getIsExpanded() ? ChevronsDownUp : ChevronsUpDown
  const expandButton = row.getCanExpand() && <Button onClick={() => row.toggleExpanded()} variant="ghost" size="icon"><ExpandIcon class="size-4" /></Button>

  function handleClick() {
    if (row.original.isProject) {
      options.onOpenEditProjectDialog(row.original.id)
    } else {
      options.onOpenEditActivityDialog(row.original.id)
    }
  }
  const editButton = <Button onClick={handleClick} variant="ghost" size="icon"><Pencil class="size-4" /></Button>

  return (
    <span class="flex justify-end gap-1 items-center">
      { expandButton }
      { editButton }
    </span>
  )
}

const columnHelper = createColumnHelper<ProjectRow>()

interface ProjectColumnsOptions {
  onOpenEditProjectDialog: (id: string) => void;
  onOpenEditActivityDialog: (id: string) => void;
}

export function  createProjectsColumns(
  options: ProjectColumnsOptions
) {
  const { t } = useI18n()

  return [
    columnHelper.accessor('shadow', {
      header: ({ column }) => getSortableHeader(column, t('settings.projects.table.columns.name')),
      cell: (info) => getNameCell(info.getValue()),
    }),
    columnHelper.accessor('color', {
      header: ({ column }) => getSortableHeader(column, t('settings.projects.table.columns.color')),
      cell: (info) => getColorCell(info.getValue()),
    }),
    columnHelper.accessor('isBillable', {
      header: ({ column }) => getSortableHeader(column, t('settings.projects.table.columns.isBillable')),
      cell: (info) => getBillableCell(info.getValue()),
    }),
    columnHelper.accessor('lastUsed', {
      header: ({ column }) => getSortableHeader(column, t('settings.projects.table.columns.lastUsed')),
      cell: (info) => getLastUsedCell(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => getActionsCell(row, options),
      meta: {
        className: 'w-0',
      }
    })
  ]
}