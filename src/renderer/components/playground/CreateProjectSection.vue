<script setup lang="ts">
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import ProjectForm from '@renderer/components/playground/ProjectForm.vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ProjectDto } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { toast } from 'vue-sonner'
import { Button } from '@renderer/components/ui/button'
import { randomTailwindColor } from '@renderer/lib/colorUtils'
import { faker } from '@faker-js/faker'

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

function insertTestProjects() {
  for (let i = 0; i < 10; i++) {
    createProject({
      displayName: faker.company.name(),
      color: randomTailwindColor(),
      isBillable: true,
    })
  }
}
</script>

<template>
  <SettingsSection>
    <ProjectForm @submit="createProject" submit-text="Create Project" #action>
      <Button type="button" @click="insertTestProjects" variant="secondary">
        Insert More Projects
      </Button>
    </ProjectForm>
  </SettingsSection>
</template>
