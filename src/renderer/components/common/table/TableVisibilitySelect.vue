<script setup lang="ts" generic="TData">
import type {Table, VisibilityState} from "@tanstack/vue-table";
import {computed} from "vue";
import Combobox from "@renderer/components/common/inputs/combobox/Combobox.vue";
import {getOrRun} from "@renderer/lib/utils";
import type {Column} from "@tanstack/table-core";

const props = defineProps<{
  table: Table<TData>
  label?: string
}>()

const columns = computed<Column<TData>[]>(() =>
  props.table.getAllColumns().filter((column) => column.getCanHide())
)

const selected = computed(() =>
  columns.value.filter((column) => props.table.getColumn(column.id)?.getIsVisible())
)

function update(value: Column<TData>[]) {
  props.table.setColumnVisibility(() =>
    columns.value.reduce((acc, column) => {
      acc[column.id] = value.includes(column)
      return acc
    }, {} as VisibilityState)
  )
}
</script>

<template>
  <Combobox
    v-model="selected"
    :options="columns"
    :display-value="(column) => getOrRun(column.columnDef.header)"
    @selected="update"
    multiple
    :label="label ?? $t('common.labels.columns')"
  />
</template>