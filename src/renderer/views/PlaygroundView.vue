<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import { projectService } from '@renderer/factory/service/projectService'
import { Input } from '@renderer/components/ui/input'
import { ref } from 'vue'
import { Switch } from '@renderer/components/ui/switch'
import { Button } from '@renderer/components/ui/button'
import ProjectEntity from '@renderer/views/ProjectEntity.vue'
import type { ProjectEntityDto } from '@shared/model/project'
import Combobox from '@renderer/components/common/inputs/combobox/Combobox.vue'
import type { Nullable } from '@shared/lib/utils/types'
import { Label } from '@renderer/components/ui/label'

const projects = ref<Array<ProjectEntityDto>>([])

function update() {
  projectService.getProjects().then((data) => {
    projects.value.splice(0, projects.value.length)
    projects.value.push(...data)
  })
}

update()

const createProjectDisplayName = ref<string>('Test Project')
const createProjectColor = ref<string>('red')
const createProjectIsBillable = ref<boolean>(false)

function handleCreateProject() {
  projectService
    .createProject({
      displayName: createProjectDisplayName.value,
      color: createProjectColor.value,
      isBillable: createProjectIsBillable.value,
    })
    .then(() => {
      update()
    })
}

const selectedProject1 = ref<Nullable<ProjectEntityDto>>(null)
const selectedProject2 = ref<Nullable<ProjectEntityDto>>(null)
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col gap-4">
    <div class="border rounded-md flex flex-col gap-4 p-4">
      <div class="ml-4 flex items-center gap-4">
        <Label class="text-right">Name</Label>
        <Input v-model="createProjectDisplayName" />
      </div>
      <div class="ml-4 flex items-center gap-4">
        <Label class="text-right">Color</Label>
        <Input v-model="createProjectColor" />
      </div>
      <div class="ml-4 flex items-center gap-4">
        <Label class="text-right">Billable</Label>
        <Switch v-model:checked="createProjectIsBillable" />
      </div>
      <div class="flex justify-end">
        <Button @click="handleCreateProject">Create Project</Button>
      </div>
    </div>
    <div class="flex flex-row gap-4">
      <div class="flex-grow flex flex-col gap-4">
        <Combobox
          :options="projects"
          v-model="selectedProject1"
          :display-value="(project) => project?.displayName"
          allow-deselect
        />
        <ProjectEntity :project-id="selectedProject1?.id" />
      </div>
      <div class="flex-grow flex flex-col gap-4">
        <Combobox
          :options="projects"
          v-model="selectedProject2"
          :display-value="(project) => project?.displayName"
          allow-deselect
        />
        <ProjectEntity :project-id="selectedProject2?.id" />
      </div>
    </div>
  </ResponsiveContainer>
</template>
