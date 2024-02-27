import type {Ref} from "vue";
import type {SortDirection, Table, Updater} from "@tanstack/vue-table";
import type {Column} from "@tanstack/table-core";
import type {Icon as LucideIcon} from "lucide-vue-next";
import {ArrowDown, ArrowDownUp, ArrowUp, ChevronsDownUp, ChevronsUpDown} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {useI18n} from "vue-i18n";

export function updater<T>(updaterOrValue: Updater<T>, value: Ref<T>) {
  value.value =
    typeof updaterOrValue === 'function'
      ? (updaterOrValue as (old: T) => T)(value.value)
      : updaterOrValue
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