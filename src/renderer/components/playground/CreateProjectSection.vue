<script setup lang="ts">
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import ProjectForm from '@renderer/components/playground/ProjectForm.vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ProjectDto } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { toast } from 'vue-sonner'

const queryClient = useQueryClient()

const { mutate: createProject } = useMutation({
  mutationFn: (project: ProjectDto) => projectService.createProject(project),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  },
  onError: (error) => {
    console.error(error)
    toast.error(error.message)
  },
})
</script>

<template>
  <SettingsSection>
    <ProjectForm @submit="createProject" submit-text="Create Project" />
  </SettingsSection>
</template>
