<script setup lang="ts">
import Combobox, {
  type ComboboxProps,
} from '@renderer/components/common/inputs/combobox/Combobox.vue'
import { useProjectsService } from '@renderer/services/projectsService'
import type { ReactiveProject } from '@renderer/model/project/types'
import { isDefined, type Nullable } from '@renderer/lib/utils'
import { createProject } from '@renderer/model/project/model'
import { computed } from 'vue'

const model = defineModel<Nullable<ReactiveProject>>({ required: true })

const props = defineProps<
  Pick<
    ComboboxProps<ReactiveProject, false>,
    | 'allowDeselect'
    | 'placeholder'
    | 'searchLabel'
    | 'emptyLabel'
    | 'class'
    | 'triggerClass'
    | 'popoverClass'
  > & {
    filter?: (project: ReactiveProject) => boolean
  }
>()

const projectsService = useProjectsService()

const filteredProjects = computed(() => {
  if (isDefined(props.filter)) {
    return projectsService.projects.filter(props.filter)
  }

  return projectsService.projects
})

function handleCreate(displayName: string) {
  const project = createProject(
    {
      displayName,
    },
    { randomColor: true },
  )

  projectsService.addProject(project)

  model.value = project
}
</script>

<template>
  <Combobox
    v-bind="props"
    v-model="model"
    :options="filteredProjects"
    :display-value="(project) => project?.displayName"
    allow-create
    @create="handleCreate"
  />
</template>
