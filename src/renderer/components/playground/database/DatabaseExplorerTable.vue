<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { database } from '@renderer/factory/database/database'
import { computed, toValue } from 'vue'
import Table from '@renderer/components/common/table/Table.vue'
import { createColumnHelper } from '@tanstack/vue-table'
import TableVisibilitySelect from '@renderer/components/common/table/TableVisibilitySelect.vue'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import { Button } from '@shadcn/button'

const props = defineProps<{
  tableName: string
}>()

const queryClient = useQueryClient()
const tableName = computed(() => props.tableName)

const { data: tableColumns } = useQuery({
  queryKey: ['databaseExplorer', 'table', tableName, 'columns'],
  queryFn: async () => {
    const { rows } = await database.execRaw(
      `PRAGMA table_info(${toValue(tableName)})`,
      [],
      'object',
    )
    return rows.map((row: any) => ({
      name: row.name,
      type: row.type,
    }))
  },
  initialData: [],
})

const { data } = useQuery({
  queryKey: ['databaseExplorer', 'table', tableName, 'data'],
  queryFn: async () => {
    const { rows } = await database.execRaw(
      `SELECT * FROM ${toValue(tableName)}`,
      [],
      'object',
    )
    return rows
  },
  initialData: [],
})

const columnHelper = createColumnHelper<object>()
const columns = computed(() => {
  return tableColumns.value.map((col) =>
    columnHelper.accessor(col.name, {
      header: `${col.name} (${col.type})`,
    }),
  )
})

function handleRefresh() {
  queryClient.invalidateQueries({
    queryKey: ['databaseExplorer', 'table', tableName, 'data'],
  })
}
</script>

<template>
  <Table :data="data" :columns="columns">
    <template #actions="{ table }">
      <TableActions>
        <template #left><slot name="actions" /></template>
        <template #right>
          <TableVisibilitySelect :table="table" />
          <Button @click="handleRefresh">Refresh</Button>
        </template>
      </TableActions>
    </template>
  </Table>
</template>
