<script setup lang="ts">
import {computed, reactive, ref} from "vue";
import {fromNow} from "@/lib/timeUtils";
import type {ReactiveProject} from "@/model/project";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import {createProjectsColumns} from "@/components/settings/projects/table/projectsColumns";
import Table from "@/components/common/table/Table.vue";
import type {ReactiveActivity} from "@/model/activity";
import {getSortedRowModel, getExpandedRowModel} from "@tanstack/vue-table";
import type {ExpandedState, SortingState, TableOptions} from '@tanstack/vue-table'
import {isDefined, type Nullable} from "@/lib/utils";
import type {ID} from "@/lib/types";
import EditProjectDialog from "@/components/settings/projects/dialog/EditProjectDialog.vue";

const props = defineProps<{
  projects: ReactiveProject[]
}>()

const state = reactive({
  editingProjectId: null as Nullable<ID>,
  editingActivityId: null as Nullable<ID>,
})

function toActivityRow(activity: ReactiveActivity): ProjectRow {
  return {
    id: activity.id,
    name: [activity.parentProject?.displayName, activity.displayName].filter(isDefined),
    billable: null,
    color: activity.color,
    lastUsed: fromNow(activity.lastUsed),
    isProject: false,
  }
}

function toProjectRow(project: ReactiveProject): ProjectRow {
  return {
    id: project.id,
    name: [project.displayName],
    billable: true,
    color: project.color,
    lastUsed: fromNow(project.lastUsed),
    activities: project.childActivities.map(toActivityRow),
    isProject: true,
  }
}

const projectsColumns = createProjectsColumns({
  onOpenEditProjectDialog: (id) => state.editingProjectId = id,
  onOpenEditActivityDialog: () => {},
})

const data = computed(() => props.projects.map(toProjectRow))

const sorting = ref<SortingState>([])
const expanded = ref<ExpandedState>({})

const tableOptions: Partial<TableOptions<ProjectRow>> = {
  state: {
    get sorting() { return sorting.value },
    get expanded() { return expanded.value }
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting.value)
        : updaterOrValue
  },
  onExpandedChange: (updaterOrValue) => {
    expanded.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(expanded.value)
        : updaterOrValue
  },
  getSubRows: (row) => row.activities,
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
}
</script>

<template>
  <Table :data="data" :columns="projectsColumns" :options="tableOptions" />
  <EditProjectDialog :id="state.editingProjectId" @close="state.editingProjectId = null" />
</template>