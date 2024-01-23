import {createColumnHelper, type Row, type SortDirection} from "@tanstack/vue-table";
import type {Column} from "@tanstack/table-core";
import type {Icon as LucideIcon} from "lucide-vue-next";
import {ArrowDown, ArrowDownUp, ArrowUp, Pencil} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import type {ReminderRow} from "@/components/settings/reminders/table/types";

function getSortableHeader(column: Column<ReminderRow>, label: string) {
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

function getActionsCell(row: Row<ReminderRow>, options: RemindersColumnsOptions) {
  return (
    <Button onClick={() => options.onOpenEditReminderDialog(row.original.id)} variant="ghost" size="icon"><Pencil class="size-4" /></Button>
  )
}


const columnHelper = createColumnHelper<ReminderRow>()

interface RemindersColumnsOptions {
  onOpenEditReminderDialog: (id: string) => void;
}

export function  createRemindersColumns(
  options: RemindersColumnsOptions
) {
  return [
    columnHelper.accessor('name', {
      header: ({ column }) => getSortableHeader(column, 'Name'),
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