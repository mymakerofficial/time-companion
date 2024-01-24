import type {Ref} from "vue";
import type {SortDirection, Updater} from "@tanstack/vue-table";
import type {Column} from "@tanstack/table-core";
import type {Icon as LucideIcon} from "lucide-vue-next";
import {ArrowDown, ArrowDownUp, ArrowUp} from "lucide-vue-next";
import {Button} from "@/components/ui/button";

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
    <Button onClick={() => column.toggleSorting()} variant="ghost" class="flex gap-1 items-center">
      <span>{ label }</span>
      <Icon class="size-3"/>
    </Button>
  )
}