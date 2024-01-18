<script setup lang="ts">
import {computed, ref} from "vue";
import {fromNow} from "@/lib/timeUtils";
import type {ReactiveProject} from "@/model/project";
import type {ProjectRow} from "@/components/settings/projects/types";
import {projectsColumns} from "@/components/settings/projects/projectsColumns";
import Table from "@/components/common/table/Table.vue";
import type {ReactiveActivity} from "@/model/activity";
import {type ExpandedState, getExpandedRowModel, type TableOptions} from "@tanstack/vue-table";

const props = defineProps<{
  projects: ReactiveProject[]
}>()

function toActivityRow(activity: ReactiveActivity): ProjectRow {
  return {
    id: activity.id,
    name: [activity.parentProject.displayName, activity.displayName],
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

const expanded = ref<ExpandedState>()

const tableOptions: Partial<TableOptions<ProjectRow>> = {
  state: {
    get expanded() { return expanded.value }
  },
  onExpandedChange: (updater) => {
    expanded.value =
      typeof updater === 'function'
        ? updater(expanded.value)
        : updater
  },
  getSubRows: (row) => row.activities,
  getExpandedRowModel: getExpandedRowModel(),
}
</script>

<template>
  <Table :data="data" :columns="projectsColumns" :options="tableOptions" />
</template>