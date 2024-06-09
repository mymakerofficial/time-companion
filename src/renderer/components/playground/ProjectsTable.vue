<script setup lang="ts">
import Table from '@renderer/components/common/table/Table.vue'
import type { ProjectDto } from '@shared/model/project'
import { createProjectColumns } from '@renderer/components/playground/projectColumns'

defineProps<{
  projects: Array<ProjectDto>
}>()

const emit = defineEmits<{
  edit: [project: ProjectDto]
}>()

function handleEmit(project: ProjectDto) {
  emit('edit', project)
}

const projectsColumns = createProjectColumns(handleEmit)
</script>

<template>
  <Table :data="projects" :columns="projectsColumns" />
</template>
