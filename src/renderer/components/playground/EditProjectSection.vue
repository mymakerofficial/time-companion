<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import type { ProjectDto } from '@shared/model/project'
import { toast } from 'vue-sonner'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import ProjectForm from '@renderer/components/playground/ProjectForm.vue'
import type { Nullable } from '@shared/lib/utils/types'
import { computed } from 'vue'
import { Button } from '@renderer/components/ui/button'
import { toString } from '@shared/lib/utils/casting'

const props = defineProps<{
  projectId: Nullable<string>
}>()

const projectId = computed(() => props.projectId)

const queryClient = useQueryClient()

const { data, isPending, isError, error } = useQuery({
  queryKey: ['projects', projectId],
  queryFn: (context) =>
    projectService.getProjectById(toString(context.queryKey[1])),
  initialData: null,
})

const { mutate: patchProject } = useMutation({
  mutationFn: (project: ProjectDto) =>
    projectService.patchProjectById(toString(projectId.value), project),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  },
  onError: (error) => {
    console.error(error)
    toast.error(error.message)
  },
})

const { mutate: deleteProject } = useMutation({
  mutationFn: () => projectService.softDeleteProject(toString(projectId.value)),
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
    <span class="text-muted-foreground">{{ projectId }}</span>
    <span v-if="isPending">Loading...</span>
    <span v-else-if="isError">Error: {{ error?.message }}</span>
    <ProjectForm
      :project="data"
      @submit="patchProject"
      submit-text="Update Project"
      #action
    >
      <Button type="button" @click="deleteProject" variant="destructive">
        Delete Project
      </Button>
    </ProjectForm>
  </SettingsSection>
</template>
