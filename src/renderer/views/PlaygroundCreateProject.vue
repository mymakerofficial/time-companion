<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import { ref } from 'vue'
import { projectService } from '@renderer/factory/service/projectService'

const createProjectDisplayName = ref<string>('Test Project')
const createProjectColor = ref<string>('red')
const createProjectIsBillable = ref<boolean>(false)

function handleCreateProject() {
  projectService.createProject({
    displayName: createProjectDisplayName.value,
    color: createProjectColor.value,
    isBillable: createProjectIsBillable.value,
  })
}
</script>

<template>
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
</template>
