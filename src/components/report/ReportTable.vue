<script setup lang="ts">
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {useProjectsStore} from "@/stores/projectsStore";
import {computed, ref} from "vue";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import ResponsiveContainer from "@/components/common/layout/ResponsiveContainer.vue";
import TableActions from "@/components/common/table/TableActions.vue";
import {createColumnHelper} from "@tanstack/vue-table";
import Table from "@/components/common/table/Table.vue";

const projectsStore = useProjectsStore();

const options = computed<ComboboxOption[]>(() => projectsStore.projects.map((project) => ({
  value: project.id,
  label: project.displayName,
})));

const showProjects = ref<string[]>([])

type Column = {
  [key: string]: object
}

const columnHelper = createColumnHelper<Column>()

const columns = computed(() => [
  ...projectsStore.projects.map((project) => columnHelper.display({
    id: project.id,
    header: () => project.displayName,
    cell: () => 0,
  })),
])
</script>

<template>
  <ResponsiveContainer class="mt-16">
    <TableActions>
      <div>
        <Combobox multiple v-model="showProjects" :options="options" :label="$t('project.title', 2)" />
      </div>
    </TableActions>
    <Table :data="[]" :columns="columns" />
  </ResponsiveContainer>
</template>
