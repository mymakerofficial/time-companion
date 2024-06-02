<script setup lang="ts">
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import { Button } from '@renderer/components/ui/button'
import ProjectsTable from '@renderer/components/playground/ProjectsTable.vue'
import { useQuery } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import type { ProjectEntityDto } from '@shared/model/project'

const emit = defineEmits<{
  edit: [project: ProjectEntityDto]
}>()

const {
  data: projects,
  isPending,
  isError,
  error,
  refetch,
} = useQuery({
  queryKey: ['projects'],
  queryFn: () => projectService.getProjects(),
})
</script>

<template>
  <SettingsSection>
    <div class="flex justify-end gap-4">
      <Button @click="refetch" variant="secondary">Refresh</Button>
    </div>
    <span v-if="isPending">Loading...</span>
    <span v-else-if="isError">Error: {{ error?.message }}</span>
    <ProjectsTable
      v-else-if="projects"
      :projects="projects"
      @edit="(project) => emit('edit', project)"
    />
  </SettingsSection>
</template>
