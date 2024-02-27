import {createColumnHelper, type Row} from "@tanstack/vue-table";
import {isNull} from "@/lib/utils";
import {
  ChevronsDownUp,
  ChevronsUpDown, Coffee, Coins, Paintbrush,
  Pencil
} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import {getSortableHeader, getToggleExpandHeader} from "@/lib/helpers/tableHelpers";
import {useI18n} from "vue-i18n";
import {Badge} from "@/components/ui/badge";
import ShadowBadge from "@/components/common/shadow/ShadowBadge.vue";
import {formatDateTime, withFormat} from "@/lib/neoTime";
import BillableSelectBadge from "@/components/common/inputs/billableSelectBadge/BillableSelectBadge.vue";
import {h} from "vue";

function getNameCell(value: ProjectRow['shadow']) {
  return <ShadowBadge shadow={value} variant="skeleton" size="md" class="font-medium" />
}

function getColorCell(value: ProjectRow['color']) {
  if (isNull(value)) {
    return null
  }

  const { t } = useI18n()

  const label = t(`common.colors.${value}`)

  return <Badge color={value} variant="ghost"><span class="bg-primary size-1.5 mr-1 rounded-full" />{label}</Badge>
}

function getBillableCell(value: ProjectRow['isBillable']) {
  if (isNull(value)) {
    return null
  }

  return h(BillableSelectBadge, { modelValue: value, 'onUpdate:modelValue': () => {} })
}

function getLastUsedCell(value: ProjectRow['lastUsed']) {
  if (isNull(value)) {
    return null
  }

  // TODO i18n
  const label = formatDateTime(value, withFormat('dd/MM/yyyy'))

  return <span class="text-muted-foreground text-xs font-medium">{label}</span>
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
      cell: ({ getValue }) => getNameCell(getValue()),
    }),
    columnHelper.accessor('color', {
      header: ({ column }) => getSortableHeader(column, t('settings.projects.table.columns.color')),
      cell: ({ getValue }) => getColorCell(getValue()),
    }),
    columnHelper.accessor('isBillable', {
      header: ({ column }) => getSortableHeader(column, t('settings.projects.table.columns.isBillable')),
      cell: ({ getValue }) => getBillableCell(getValue()),
    }),
    columnHelper.accessor('lastUsed', {
      header: ({ column }) => getSortableHeader(column, t('settings.projects.table.columns.lastUsed')),
      cell: ({ getValue }) => getLastUsedCell(getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: ({ table }) => getToggleExpandHeader(table),
      cell: ({ row }) => getActionsCell(row, options),
      meta: {
        className: 'w-0',
      }
    })
  ]
}