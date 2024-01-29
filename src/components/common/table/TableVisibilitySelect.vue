<script setup lang="ts" generic="TData">
import type {Table, VisibilityState} from "@tanstack/vue-table";
import {computed} from "vue";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";

const props = defineProps<{
  table: Table<TData>
  label?: string
}>()

const options = computed<ComboboxOption[]>(() => {
  return props.table.getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column) => ({
      value: column.id,
      label: column.columnDef.header?.() ?? column.id,
    }))
})

const selected = computed<ComboboxOption['value'][]>({
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