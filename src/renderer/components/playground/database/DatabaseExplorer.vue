<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { database } from '@renderer/factory/database/database'
import { firstOf } from '@shared/lib/utils/list'
import DatabaseExplorerTable from '@renderer/components/playground/database/DatabaseExplorerTable.vue'
import Combobox from '@renderer/components/common/inputs/combobox/Combobox.vue'
import { onMounted, ref } from 'vue'
import { whenever } from '@vueuse/core'
import { sql } from 'drizzle-orm'

const queryClient = useQueryClient()

const { data: tables } = useQuery({
  queryKey: ['databaseExplorer', 'tables'],
  queryFn: () => {
    const res = database.all<string[]>(
      sql.raw(`SELECT name FROM sqlite_schema WHERE type = 'table'`),
    )
    return res.map(firstOf)
  },
  initialData: [],
})

const table = ref<string | null>(null)
whenever(
  () => tables.value.length && !table.value,
  () => {
    table.value = firstOf(tables.value)
  },
)

onMounted(() => {
  queryClient.refetchQueries({
    queryKey: ['databaseExplorer'],
  })
})
</script>

<template>
  <DatabaseExplorerTable v-if="table" :table-name="table">
    <template #left>
      <Combobox v-model="table" :options="tables" />
      <slot name="left" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </DatabaseExplorerTable>
</template>
