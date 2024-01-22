import {createColumnHelper, type Row, type SortDirection} from "@tanstack/vue-table";
import {getColorStyleVariables} from "@/directives/vProvideColor";
import {isNull} from "@/lib/utils";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Pencil,
  Slash,
  X
} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import type {Column} from "@tanstack/table-core";
import type {Icon as LucideIcon} from "lucide-vue-next";
import {fromNow} from "@/lib/timeUtils";

function getSortableHeader(column: Column<ProjectRow>, label: string) {
  const dir = column.getIsSorted() || 'none'

  const icons: Record<'none' | SortDirection, LucideIcon> = {
    'none': ArrowDownUp,
    'desc': ArrowUp,
    'asc': ArrowDown,
  }

  const Icon = icons[dir]

  return <>
    <Button onClick={() => column.toggleSorting()} variant="ghost" class="flex gap-1 items-center">
      <span>{ label }</span>
      <Icon class="size-3"/>
    </Button>
  </>
}

function getNameCell(value: ProjectRow['name']) {
  const projectPart = <span>{value[0]}</span>
  const activityPart = value[1] && <><Slash class="size-3"/><span>{value[1]}</span></>

  return (
    <span class="flex items-center gap-2">
      { projectPart }
      { activityPart }
    </span>
  )
}

function getColorCell(value: ProjectRow['color']) {
  if (isNull(value)) {
    return null
  }

  return <div style={getColorStyleVariables(value)} class="size-3 rounded-full bg-primary" />
}

function getBillableCell(value: ProjectRow['isBillable']) {
  if (isNull(value)) {
    return null
  }

  return value ? <Check class="size-4" /> : <X class="size-4 text-muted-foreground" />
}

function getLastUsedCell(value: ProjectRow['lastUsed']) {
  if (isNull(value)) {
    return null
  }

  return fromNow(value)
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
  return [
    columnHelper.accessor('name', {
      header: ({ column }) => getSortableHeader(column, 'Name'),
      cell: (info) => getNameCell(info.getValue()),
    }),
    columnHelper.accessor('color', {
      header: ({ column }) => getSortableHeader(column, 'Color'),
      cell: (info) => getColorCell(info.getValue()),
    }),
    columnHelper.accessor('isBillable', {
      header: ({ column }) => getSortableHeader(column, 'Billable'),
      cell: (info) => getBillableCell(info.getValue()),
    }),
    columnHelper.accessor('lastUsed', {
      header: ({ column }) => getSortableHeader(column, 'Last used'),
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