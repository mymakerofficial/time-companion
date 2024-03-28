<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import { projectService } from '@renderer/factory/service/projectService'
import { Input } from '@renderer/components/ui/input'
import { reactive, ref } from 'vue'
import { Switch } from '@renderer/components/ui/switch'
import { Button } from '@renderer/components/ui/button'
import ProjectEntity from '@renderer/views/ProjectEntity.vue'
import type { ProjectEntityDto } from '@shared/model/project'

const projects = reactive<Array<ProjectEntityDto>>([])

function update() {
  projectService.getProjects().then((data) => {
    projects.splice(0, projects.length)
    projects.push(...data)
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
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col gap-4">
    <div class="text-2xl font-bold">Playground</div>
    <div class="border rounded-md flex flex-col gap-4 p-4">
      <div class="text-xl font-bold mb-4">Create Project</div>
      <Input v-model="createProjectDisplayName" placeholder="displayName" />
      <Input v-model="createProjectColor" placeholder="color" />
      <label class="flex items-center gap-2">
        Billable
        <Switch v-model:checked="createProjectIsBillable" />
      </label>
      <Button @click="handleCreateProject">Create Project</Button>
    </div>
    <div class="flex flex-row gap-4">
      <div class="flex-grow flex flex-col gap-4">
        <ProjectEntity
          v-for="project in projects"
          :project-id="project.id"
          :key="project.id"
        />
      </div>
      <div class="flex-grow flex flex-col gap-4">
        <ProjectEntity
          v-for="project in projects"
          :project-id="project.id"
          :key="project.id"
        />
      </div>
    </div>
  </ResponsiveContainer>
</template>
