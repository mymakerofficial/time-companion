import type {Ref} from "vue";
import type {CellContext, RowData, SortDirection, Table, Updater} from "@tanstack/vue-table";
import type {Column} from "@tanstack/table-core";
import type {Icon as LucideIcon} from "lucide-vue-next";
import {ArrowDown, ArrowDownUp, ArrowUp, ChevronsDownUp, ChevronsUpDown} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {useI18n} from "vue-i18n";

export type DataUpdater<TRow extends RowData> = (rowIndex: number, columnAccessor: keyof TRow, value: unknown) => void

export function updater<T>(updaterOrValue: Updater<T>, value: Ref<T>) {
  value.value =
    typeof updaterOrValue === 'function'
      ? (updaterOrValue as (old: T) => T)(value.value)
      : updaterOrValue
}

export function defineTableCell<TData extends RowData, TKey extends keyof TData>
  (cellFactory: (value: TData[TKey]) => unknown):
  (context: CellContext<TData, TData[TKey]>) => unknown {
  return (context) => {
    const value = context.getValue() as TData[TKey]
    return cellFactory(value)
  }
}

export function defineEditableTableCell<TData extends RowData, TKey extends keyof TData>
  (cellFactory: (value: TData[TKey], updateValue: (newValue: TData[TKey]) => void) => unknown):
  (context: CellContext<TData, TData[TKey]>, updateData: DataUpdater<TData>) => unknown {
  return (context, updateData) => {
    const value = context.getValue() as TData[TKey]
    const updateValue = (newValue: TData[TKey]) => {
      updateData(context.row.index, context.column.id as TKey, newValue)
    }

    return cellFactory(value, updateValue)
  }
}

export function getSortableHeader<T>(column: Column<T>, label: string) {
  const dir = column.getIsSorted() || 'none'

  const icons: Record<'none' | SortDirection, LucideIcon> = {
    'none': ArrowDownUp,
    'desc': ArrowUp,
    'asc': ArrowDown,
  }

  const Icon = icons[dir]

  return (
    <Button onClick={() => column.toggleSorting()} variant="ghost" class="flex gap-2 items-center -mx-2 px-2">
      <span>{ label }</span>
      <Icon class="size-3.5"/>
    </Button>
  )
}

export function getToggleExpandHeader<T>(table: Table<T>) {
  const { t } = useI18n()

  const label = table.getIsAllRowsExpanded() ?
    t('common.controls.collapseAll') :
    t('common.controls.expandAll')

  const Icon = table.getIsAllRowsExpanded() ?
    ChevronsDownUp :
    ChevronsUpDown

  return (
    <Button onClick={() => table.toggleAllRowsExpanded()} variant="ghost" class="flex gap-2 items-center ml-auto -mx-2 px-2">
      <span class="text-nowrap">{ label }</span>
      <Icon class="size-3.5"/>
    </Button>
  )
}