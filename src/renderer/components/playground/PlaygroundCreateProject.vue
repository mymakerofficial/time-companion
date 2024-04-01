<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import { reactive } from 'vue'
import { projectService } from '@renderer/factory/service/projectService'
import ColorSelect from '@renderer/components/common/inputs/colorSelect/ColorSelect.vue'
import { PlusCircle } from 'lucide-vue-next'
import type { ProjectDto } from '@shared/model/project'

const project = reactive<ProjectDto>({
  displayName: 'Test Project',
  color: 'red',
  isBillable: false,
})

function handleCreateProject() {
  projectService.createProject({ ...project })
}
</script>

<template>
  <div class="border rounded-md flex flex-col gap-4 p-4">
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Name</Label>
      <Input v-model="project.displayName" />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Color</Label>
      <ColorSelect v-model="project.color" />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Billable</Label>
      <Switch v-model:checked="project.isBillable" />
    </div>
    <div class="flex justify-end">
      <Button @click="handleCreateProject" class="gap-2">
        Create Project <PlusCircle class="size-4" />
      </Button>
    </div>
  </div>
</template>
