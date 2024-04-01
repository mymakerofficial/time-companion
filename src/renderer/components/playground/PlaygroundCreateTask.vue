<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { reactive, ref } from 'vue'
import ColorSelect from '@renderer/components/common/inputs/colorSelect/ColorSelect.vue'
import { useProjectsList } from '@renderer/composables/project/useProjectsList'
import type { TaskDto } from '@shared/model/task'
import { taskService } from '@renderer/factory/service/taskService'
import Combobox from '@renderer/components/common/inputs/combobox/Combobox.vue'
import type { Nullable } from '@shared/lib/utils/types'
import type { ProjectEntityDto } from '@shared/model/project'
import { PlusCircle } from 'lucide-vue-next'

const projects = useProjectsList()

const task = reactive<Omit<TaskDto, 'projectId'>>({
  displayName: 'Test Task',
  color: 'green',
})

const selectedProject = ref<Nullable<ProjectEntityDto>>(null)

function handleCreate() {
  taskService.createTask({
    ...task,
    projectId: selectedProject.value?.id ?? 'no-id',
  })
}
</script>

<template>
  <div class="border rounded-md flex flex-col gap-4 p-4">
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Project</Label>
      <Combobox
        v-model="selectedProject"
        :options="projects"
        :display-value="(project) => project?.displayName"
        allow-deselect
      />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Name</Label>
      <Input v-model="task.displayName" />
    </div>
    <div class="ml-4 flex items-center gap-4">
      <Label class="text-right">Color</Label>
      <ColorSelect v-model="task.color" />
    </div>
    <div class="flex justify-end">
      <Button @click="handleCreate" class="gap-2">
        Create Task <PlusCircle class="size-4" />
      </Button>
    </div>
  </div>
</template>
