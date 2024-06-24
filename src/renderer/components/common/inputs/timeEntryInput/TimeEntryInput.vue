<script setup lang="ts">
import { Input } from '@renderer/components/ui/input'
import ProjectSelect from '@renderer/components/common/inputs/projectInput/ProjectSelect.vue'
import type { Nullable } from '@shared/lib/utils/types'
import { useGetProjectById } from '@renderer/composables/queries/projects/useGetProjectById'
import { vProvideColor } from '@renderer/directives/vProvideColor'
import { Dot, Tag } from 'lucide-vue-next'

const projectId = defineModel<Nullable<string>>('projectId', {
  required: true,
})
const description = defineModel<string>('description', { required: true })
const emit = defineEmits<{
  change: []
}>()

const { data: project } = useGetProjectById(projectId)

function handleChange() {
  emit('change')
}
</script>

<template>
  <div class="flex flex-row items-center gap-2">
    <slot name="leading" />
    <Input
      v-model="description"
      @change="handleChange"
      :placeholder="$t('dashboard.labels.whatAreYouWorkingOn')"
    >
      <template #leading>
        <ProjectSelect
          v-model="projectId"
          allow-deselect
          @change="handleChange"
          trigger-class="w-fit pr-2"
        >
          <template #trigger>
            <Tag v-if="!project" class="w-4 mr-1" />
            <span
              v-else
              v-provide-color="project?.color"
              class="text-nowrap text-color flex gap-2 items-center"
            >
              {{ project?.displayName ?? 'Select Project...' }}
              <Dot />
            </span>
          </template>
        </ProjectSelect>
      </template>
      <template #trailing>
        <slot name="input-trailing" />
      </template>
    </Input>
    <slot name="trailing" />
  </div>
</template>
