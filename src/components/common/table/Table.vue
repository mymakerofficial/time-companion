<script setup lang="ts" generic="T">
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {isNotEmpty} from "@/lib/listUtils";
import {
  useVueTable,
  FlexRender,
  getCoreRowModel,
} from "@tanstack/vue-table";
import {ColumnDef} from "@tanstack/table-core/build/lib/types";
import NoEntries from "@/components/common/table/NoEntries.vue";

const props = defineProps<{
  data: T[]
  columns: ColumnDef<T>[]
}>()

const table = useVueTable({
  data: props.data,
  columns: props.columns,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div class="rounded-md overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
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
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <NoEntries v-else />
      </TableBody>
    </Table>
  </div>
</template>