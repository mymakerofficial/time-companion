<script setup lang="ts" generic="TData">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table'
import { isNotEmpty } from '@renderer/lib/listUtils'
import {
  useVueTable,
  FlexRender,
  getCoreRowModel,
  type TableOptions,
} from '@tanstack/vue-table'
import NoEntries from '@renderer/components/common/table/NoEntries.vue'

const props = defineProps<{
  class?: string
  data: TableOptions<TData>['data']
  columns: TableOptions<TData>['columns']
  options?: Partial<TableOptions<TData>>
}>()

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  ...props.options,
})
</script>

<template>
  <slot name="actions" :table="table" />
  <div class="rounded-md overflow-hidden">
    <Table :class="props.class">
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :class="(header.column.columnDef.meta as any)?.className"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="isNotEmpty(table.getRowModel().rows)">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() && 'selected'"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="(cell.column.columnDef.meta as any)?.className"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        <NoEntries :col-span="columns.length" v-else />
      </TableBody>
    </Table>
  </div>
</template>
