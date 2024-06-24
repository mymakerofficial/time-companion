<script setup lang="ts">
import Combobox, {
  type ComboboxProps,
} from '@renderer/components/common/inputs/combobox/Combobox.vue'
import { type Nullable } from '@renderer/lib/utils'
import { useGetProjects } from '@renderer/composables/queries/projects/useGetProjects'
import type { ProjectDto } from '@shared/model/project'
import { useCreateProject } from '@renderer/composables/mutations/projects/useCreateProject'
import { computed } from 'vue'

const model = defineModel<Nullable<string>>({ required: true })
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
const emit = defineEmits<{
  change: [string]
  create: [string]
}>()

function handleCreated(project: ProjectDto) {
  model.value = project.id
  emit('change', project.id)
}

const { data: projects } = useGetProjects()
const { mutate: createProject } = useCreateProject({
  onSuccess: handleCreated,
})

const ids = computed(() => projects.value.map((project) => project.id))

function getDisplayName(id: string) {
  return projects.value.find((project) => project.id === id)?.displayName ?? ''
}

function handleChange(value: string) {
  emit('change', value)
}

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
    :options="ids"
    :display-value="getDisplayName"
    allow-create
    @create="handleCreate"
    @selected="handleChange!"
  >
    <template #trigger="value">
      <slot name="trigger" v-bind="value" />
    </template>
  </Combobox>
</template>
