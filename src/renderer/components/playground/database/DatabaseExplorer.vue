<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { database } from '@renderer/factory/database/database'
import { firstOf } from '@shared/lib/utils/list'
import DatabaseExplorerTable from '@renderer/components/playground/database/DatabaseExplorerTable.vue'
import Combobox from '@renderer/components/common/inputs/combobox/Combobox.vue'
import { ref } from 'vue'
import { whenever } from '@vueuse/core'

const { data: tables } = useQuery({
  queryKey: ['databaseExplorer', 'tables'],
  queryFn: async () => {
    const { rows } = await database.execRaw(
      `SELECT name FROM sqlite_schema WHERE type ='table'`,
    )
    return rows.map(firstOf)
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
</script>

<template>
  <DatabaseExplorerTable v-if="table" :table-name="table">
    <template #actions>
      <Combobox v-model="table" :options="tables" />
    </template>
  </DatabaseExplorerTable>
</template>
