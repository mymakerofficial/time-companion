<script setup lang="ts">
import {computed, ref} from "vue";
import {fromNow} from "@/lib/timeUtils";
import type {ReactiveProject} from "@/model/project";
import type {ProjectRow} from "@/components/settings/projects/types";
import {projectsColumns} from "@/components/settings/projects/projectsColumns";
import Table from "@/components/common/table/Table.vue";
import type {ReactiveActivity} from "@/model/activity";
import {getSortedRowModel, getExpandedRowModel} from "@tanstack/vue-table";
import type {ExpandedState, SortingState, TableOptions} from '@tanstack/vue-table'
import {isDefined} from "@/lib/utils";

const props = defineProps<{
  projects: ReactiveProject[]
}>()

function toActivityRow(activity: ReactiveActivity): ProjectRow {
  return {
    id: activity.id,
    name: [activity.parentProject?.displayName, activity.displayName].filter(isDefined),
    billable: null,
    color: activity.color,
    lastUsed: fromNow(activity.lastUsed),
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
  }
}

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
</template>