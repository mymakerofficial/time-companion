<script setup lang="ts" generic="TData">
import type {Table, VisibilityState} from "@tanstack/vue-table";
import {computed} from "vue";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import Combobox from "@/components/common/inputs/combobox/ComboboxOld.vue";
import {getOrRun} from "@/lib/utils";

const props = defineProps<{
  table: Table<TData>
  label?: string
}>()

const options = computed(() => {
  return props.table.getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column): ComboboxOption => ({
      value: column.id,
      label: getOrRun(column.columnDef.header),
    }))
})

const selected = computed<string[]>({
  get() {
    return options.value
      .filter((option) => props.table.getColumn(option.value)?.getIsVisible())
      .map((option) => option.value)
  },
  set(value) {
    props.table.setColumnVisibility(() => {
      return options.value.reduce((acc, option) => {
        acc[option.value] = value.includes(option.value)
        return acc
      }, {} as VisibilityState)
    })
  },
})
</script>

<template>
  <Combobox multiple v-model="selected" :options="options" :label="label ?? $t('common.labels.columns')" />
</template>