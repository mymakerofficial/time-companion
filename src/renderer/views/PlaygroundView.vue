<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import { projectService } from '@renderer/factory/service/projectService'
import { onUnmounted, ref } from 'vue'
import { Switch } from '@renderer/components/ui/switch'
import ProjectEntity from '@renderer/views/ProjectEntity.vue'
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
import PlaygroundCreateProject from '@renderer/views/PlaygroundCreateProject.vue'
import { watchImmediate } from '@vueuse/core'
import { isDefined } from '@shared/lib/utils/checks'
import { Button } from '@renderer/components/ui/button'

const projects = useProjectsList()

const showToasts = ref<boolean>(true)

const selectedProject1 = ref<Nullable<ProjectEntityDto>>(null)
const selectedProject2 = ref<Nullable<ProjectEntityDto>>(null)

function onNewProjectCreated(event: EntityPublisherEvent<ProjectEntityDto>) {
  if (event.type !== 'created') {
    return
  }

  selectedProject1.value = event.data
  selectedProject2.value = event.data
}

function onNotify(
  event: EntityPublisherEvent<ProjectEntityDto>,
  topics: PublisherTopics<EntityPublisherTopics<ProjectEntityDto>>,
) {
  toast.message(`${topics.type} ${topics.entityId} ${topics.field}`, {
    description: JSON.stringify(event),
  })
}

projectService.subscribe({ type: 'created' }, onNewProjectCreated)

watchImmediate(showToasts, (value) => {
  if (value) {
    toast.message('Toasts enabled')
    projectService.subscribe({}, onNotify)
  } else {
    toast.message('Toasts disabled')
    projectService.unsubscribe({}, onNotify)
  }
})

onUnmounted(() => {
  projectService.unsubscribe({ type: 'created' }, onNewProjectCreated)
  projectService.unsubscribe({}, onNotify)
})

function handleNewWindow() {
  if (!isDefined(window.electronAPI)) {
    return
  }

  window.electronAPI.electron.createNewWindow()
}
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col gap-4">
    <div class="border rounded-md flex items-center justify-between gap-4 p-4">
      <Button @click="handleNewWindow">New Window</Button>
      <div class="ml-4 flex items-center gap-4">
        <Label class="text-right">Show toasts</Label>
        <Switch v-model:checked="showToasts" />
      </div>
    </div>
    <PlaygroundCreateProject />
    <div class="flex flex-row gap-4">
      <div class="flex-grow flex flex-col gap-4">
        <ProjectEntity :project-id="selectedProject1?.id">
          <RadioGroup
            :options="[null, ...projects]"
            v-model="selectedProject1"
            :display-value="(project) => project?.displayName ?? 'None'"
            :get-key="(project) => project?.id ?? 'none'"
          />
          <Separator />
        </ProjectEntity>
      </div>
      <div class="flex-grow flex flex-col gap-4">
        <ProjectEntity :project-id="selectedProject2?.id">
          <RadioGroup
            :options="[null, ...projects]"
            v-model="selectedProject2"
            :display-value="(project) => project?.displayName ?? 'None'"
            :get-key="(project) => project?.id ?? 'none'"
          />
          <Separator />
        </ProjectEntity>
      </div>
    </div>
  </ResponsiveContainer>
</template>
