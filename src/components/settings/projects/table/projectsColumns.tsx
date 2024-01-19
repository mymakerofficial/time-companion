import {createColumnHelper} from "@tanstack/vue-table";
import {getColorStyleVariables} from "@/directives/vProvideColor";
import {isNotNull} from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronsDownUp,
  ChevronsUpDown,
  Circle,
  Pencil,
  Slash
} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import type {Column} from "@tanstack/table-core";

function getHeader(column: Column<ProjectRow>, label: string) {
  return <>
    <Button onClick={() => column.toggleSorting()} variant="ghost" class="flex gap-1 items-center">
      <span>{ label }</span>
      { !column.getIsSorted() && <ChevronsUpDown class="size-3"/> }
      { column.getIsSorted() === 'desc' && <ArrowUp class="size-3"/> }
      { column.getIsSorted() === 'asc' && <ArrowDown class="size-3"/> }
    </Button>
  </>
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
      header: ({ column }) => getHeader(column, 'Name'),
      cell: (info) => <>
      <span class="flex items-center gap-2">
        <span>{info.getValue()[0]}</span>
        {info.getValue()[1] && <>
            <Slash class="size-3"/>
            <span>{info.getValue()[1]}</span>
        </>}
      </span>
      </>,
    }),
    columnHelper.accessor('color', {
      header: 'Color',
      cell: (info) => info.getValue() && <div style={getColorStyleVariables(info.getValue())} class="size-3 rounded-full bg-primary" />,
    }),
    columnHelper.accessor('billable', {
      header: 'Billable',
      cell: (info) => isNotNull(info.getValue()) && <>{ info.getValue() ? <CheckCircle2 class="size-4" /> : <Circle class="size-4" /> }</>, // i dont like ternary operators
    }),
    columnHelper.accessor('lastUsed', {
      header: 'Last Used',
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => <>
      <span class="flex justify-end gap-1 items-center">
        { row.getCanExpand() && <Button onClick={() => row.toggleExpanded()} variant="ghost" size="icon">{ row.getIsExpanded() ? <ChevronsDownUp class="size-4" /> : <ChevronsUpDown class="size-4" /> }</Button> }
        <Button onClick={() => row.original.isProject ? options.onOpenEditProjectDialog(row.original.id) : options.onOpenEditActivityDialog(row.original.id)} variant="ghost" size="icon"><Pencil class="size-4" /></Button>
      </span>
      </>,
      meta: {
        className: 'w-10',
      }
    })
  ]
}