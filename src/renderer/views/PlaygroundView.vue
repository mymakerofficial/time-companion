<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import { projectService } from '@renderer/factory/service/projectService'
import { onUnmounted, ref } from 'vue'
import { Switch } from '@renderer/components/ui/switch'
import ProjectEntity from '@renderer/components/playground/ProjectEntity.vue'
import type { ProjectEntityDto } from '@shared/model/project'
import type { Nullable } from '@shared/lib/utils/types'
import { Label } from '@renderer/components/ui/label'
import RadioGroup from '@renderer/components/common/inputs/radioGroup/RadioGroup.vue'
import { useProjectsList } from '@renderer/composables/project/useProjectsList'
import type {
  EntityPublisherEvent,
  EntityPublisherTopics,
} from '@shared/events/entityPublisher'
import { Separator } from '@renderer/components/ui/separator'
import { toast } from 'vue-sonner'
import type { PublisherTopics } from '@shared/events/publisher'
import PlaygroundCreateProject from '@renderer/components/playground/PlaygroundCreateProject.vue'
import { watchImmediate } from '@vueuse/core'
import { isDefined } from '@shared/lib/utils/checks'
import { Button } from '@renderer/components/ui/button'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import PlaygroundCreateTask from '@renderer/components/playground/PlaygroundCreateTask.vue'
import { AppWindow, Plus } from 'lucide-vue-next'
import { useTasksList } from '@renderer/composables/project/useTasksList'
import type { TaskEntityDto } from '@shared/model/task'
import { taskService } from '@renderer/factory/service/taskService'
import TaskEntity from '@renderer/components/playground/TaskEntity.vue'

const projects = useProjectsList()
const tasks = useTasksList()

const showToasts = ref<boolean>(false)

const showSecondProject = ref<boolean>(false)
const selectedProject1 = ref<Nullable<ProjectEntityDto>>(null)
const selectedProject2 = ref<Nullable<ProjectEntityDto>>(null)

const showSecondTask = ref<boolean>(false)
const selectedTask1 = ref<Nullable<TaskEntityDto>>(null)
const selectedTask2 = ref<Nullable<TaskEntityDto>>(null)

function onNewProjectCreated(event: EntityPublisherEvent<ProjectEntityDto>) {
  if (event.type !== 'created') {
    return
  }

  selectedProject1.value = event.data
  selectedProject2.value = event.data
}

function onNewTaskCreated(event: EntityPublisherEvent<TaskEntityDto>) {
  if (event.type !== 'created') {
    return
  }

  selectedTask1.value = event.data
  selectedTask2.value = event.data
}

function onProjectsNotify(
  event: EntityPublisherEvent<ProjectEntityDto>,
  topics: PublisherTopics<EntityPublisherTopics<ProjectEntityDto>>,
) {
  toast.message(`project ${topics.type} ${topics.entityId} ${topics.field}`, {
    description: JSON.stringify(event),
  })
}

function onTasksNotify(
  event: EntityPublisherEvent<TaskEntityDto>,
  topics: PublisherTopics<EntityPublisherTopics<TaskEntityDto>>,
) {
  toast.message(`task ${topics.type} ${topics.entityId} ${topics.field}`, {
    description: JSON.stringify(event),
  })
}

projectService.subscribe({ type: 'created' }, onNewProjectCreated)
taskService.subscribe({ type: 'created' }, onNewTaskCreated)

watchImmediate(showToasts, (value) => {
  if (value) {
    toast.message('Toasts enabled', {
      action: {
        label: 'disable',
        onClick: () => {
          showToasts.value = false
        },
      },
    })
    projectService.subscribe({}, onProjectsNotify)
    taskService.subscribe({}, onTasksNotify)
  } else {
    toast.message('Toasts disabled', {
      action: {
        label: 'enable',
        onClick: () => {
          showToasts.value = true
        },
      },
    })
    projectService.unsubscribe({}, onProjectsNotify)
    taskService.unsubscribe({}, onTasksNotify)
  }
})

onUnmounted(() => {
  projectService.unsubscribe({ type: 'created' }, onNewProjectCreated)
  taskService.unsubscribe({ type: 'created' }, onNewTaskCreated)

  projectService.unsubscribe({}, onProjectsNotify)
  taskService.unsubscribe({}, onTasksNotify)
})

function handleNewWindow() {
  if (!isDefined(window.electronAPI)) {
    return
  }

  window.electronAPI.electron.createNewWindow()
}
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col">
    <SettingsSection title="Playground">
      <div class="flex items-center justify-between gap-4">
        <Button @click="handleNewWindow" class="gap-2">
          New Window <AppWindow class="size-4" />
        </Button>
        <div class="ml-4 flex items-center gap-4">
          <Label class="text-right">Show toasts</Label>
          <Switch v-model:checked="showToasts" />
        </div>
      </div>
    </SettingsSection>
    <SettingsSection title="Projects">
      <PlaygroundCreateProject />
      <div class="flex flex-row gap-4">
        <ProjectEntity :project-id="selectedProject1?.id" class="flex-grow">
          <RadioGroup
            :options="[null, ...projects]"
            v-model="selectedProject1"
            :display-value="(project) => project?.displayName ?? 'None'"
            :get-key="(project) => project?.id ?? 'none'"
          />
          <Separator />
        </ProjectEntity>
        <ProjectEntity
          v-if="showSecondProject"
          :project-id="selectedProject2?.id"
          class="flex-grow"
        >
          <RadioGroup
            :options="[null, ...projects]"
            v-model="selectedProject2"
            :display-value="(project) => project?.displayName ?? 'None'"
            :get-key="(project) => project?.id ?? 'none'"
          />
          <Separator />
        </ProjectEntity>
        <button
          v-else
          @click="() => (showSecondProject = true)"
          class="w-1/6 flex justify-center items-center border rounded-md"
        >
          <Plus class="size-6" />
        </button>
      </div>
    </SettingsSection>
    <SettingsSection title="Tasks">
      <PlaygroundCreateTask />
      <div class="flex flex-row gap-4">
        <TaskEntity :task-id="selectedTask1?.id" class="flex-grow">
          <RadioGroup
            :options="[null, ...tasks]"
            v-model="selectedTask1"
            :display-value="(task) => task?.displayName ?? 'None'"
            :get-key="(task) => task?.id ?? 'none'"
          />
          <Separator />
        </TaskEntity>
        <TaskEntity
          v-if="showSecondTask"
          :task-id="selectedTask2?.id"
          class="flex-grow"
        >
          <RadioGroup
            :options="[null, ...tasks]"
            v-model="selectedTask2"
            :display-value="(task) => task?.displayName ?? 'None'"
            :get-key="(task) => task?.id ?? 'none'"
          />
          <Separator />
        </TaskEntity>
        <button
          v-else
          @click="() => (showSecondTask = true)"
          class="w-1/6 flex justify-center items-center border rounded-md"
        >
          <Plus class="size-6" />
        </button>
      </div>
    </SettingsSection>
  </ResponsiveContainer>
</template>
