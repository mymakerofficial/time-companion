<script setup lang="tsx">
import {computed, ref} from "vue";
import type {ReactiveProject} from "@/model/project/";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import {createProjectsColumns} from "@/components/settings/projects/table/projectsColumns";
import Table from "@/components/common/table/Table.vue";
import {getSortedRowModel, getExpandedRowModel} from "@tanstack/vue-table";
import type {ExpandedState, SortingState, TableOptions} from '@tanstack/vue-table'
import EditProjectDialog from "@/components/settings/projects/projectDialog/EditProjectDialog.vue";
import EditActivityDialog from "@/components/settings/projects/activityDialog/EditActivityDialog.vue";
import {useDialogStore} from "@/stores/dialogStore";
import {toProjectRow} from "@/components/settings/projects/table/helpers";
import {updater} from "@/helpers/table/tableHelpers";

const props = defineProps<{
  projects: ReactiveProject[]
}>()

const dialogStore = useDialogStore()

const projectsColumns = createProjectsColumns({
  onOpenEditProjectDialog: (id) => {
    dialogStore.openDialog(<EditProjectDialog id={id} />)
  },
  onOpenEditActivityDialog: (id) => {
    dialogStore.openDialog(<EditActivityDialog id={id} />)
  },
})

const data = computed(() => props.projects.map(toProjectRow))

const sorting = ref<SortingState>([])
const expanded = ref<ExpandedState>({})

const tableOptions: Partial<TableOptions<ProjectRow>> = {
  state: {
    get sorting() { return sorting.value },
    get expanded() { return expanded.value }
  },
  onSortingChange: (updaterOrValue) => updater(updaterOrValue, sorting),
  onExpandedChange: (updaterOrValue) => updater(updaterOrValue, expanded),
  getSubRows: (row) => row.activities,
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
}
</script>

<template>
  <Table :data="data" :columns="projectsColumns" :options="tableOptions" />
</template>