<script setup lang="ts">
import Combobox, {
  type ComboboxProps,
} from '@renderer/components/common/inputs/combobox/Combobox.vue'
import { type Nullable } from '@renderer/lib/utils'
import { useGetProjects } from '@renderer/composables/queries/projects/useGetProjects'
import type { ProjectDto } from '@shared/model/project'
import { useCreateProject } from '@renderer/composables/mutations/projects/useCreateProject'

const model = defineModel<Nullable<ProjectDto>>({ required: true })

const props =
  defineProps<
    Pick<
      ComboboxProps<ProjectDto, false>,
      | 'allowDeselect'
      | 'placeholder'
      | 'searchLabel'
      | 'emptyLabel'
      | 'class'
      | 'triggerClass'
      | 'popoverClass'
    >
  >()

function handleCreated(project: ProjectDto) {
  model.value = project
}

const { data: projects } = useGetProjects()
const { mutate: createProject } = useCreateProject({
  onSuccess: handleCreated,
})

function handleCreate(displayName: string) {
  createProject({
    displayName,
  })
}
</script>

<template>
  <Combobox
    v-bind="props"
    v-model="model"
    :options="projects"
    :get-key="(project) => project?.id"
    :display-value="(project) => project?.displayName"
    allow-create
    @create="handleCreate"
  />
</template>
