<script setup lang="ts">
import Table from '@renderer/components/common/table/Table.vue'
import type { ProjectEntityDto } from '@shared/model/project'
import { createProjectColumns } from '@renderer/components/playground/projectColumns'

defineProps<{
  projects: Array<ProjectEntityDto>
}>()

const emit = defineEmits<{
  edit: [project: ProjectEntityDto]
}>()

function handleEmit(project: ProjectEntityDto) {
  emit('edit', project)
}

const projectsColumns = createProjectColumns(handleEmit)
</script>

<template>
  <Table :data="projects" :columns="projectsColumns" />
</template>
