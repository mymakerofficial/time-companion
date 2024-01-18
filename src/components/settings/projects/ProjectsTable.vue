<script setup lang="ts">
import {computed} from "vue";
import {fromNow} from "@/lib/timeUtils";
import type {ReactiveProject} from "@/model/project";
import type {ProjectRow} from "@/components/settings/projects/types";
import {projectsColumns} from "@/components/settings/projects/projectsColumns";
import Table from "@/components/common/table/Table.vue";

const props = defineProps<{
  projects: ReactiveProject[]
}>()

const data = computed(() => props.projects.map((project) => ({
  id: project.id,
  name: project.displayName,
  billable: true,
  color: project.color,
  lastUsed: fromNow(project.lastUsed),
})) as ProjectRow[])
</script>

<template>
  <Table :data="data" :columns="projectsColumns" />
</template>