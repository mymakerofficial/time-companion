<script setup lang="ts">
import { Input } from '@renderer/components/ui/input'
import ProjectSelect from '@renderer/components/common/inputs/projectInput/ProjectSelect.vue'
import type { Nullable } from '@shared/lib/utils/types'

const projectId = defineModel<Nullable<string>>('projectId', {
  required: true,
})
const description = defineModel<string>('description', { required: true })
const emit = defineEmits<{
  change: []
}>()

function handleChange() {
  emit('change')
}
</script>

<template>
  <div class="flex flex-row items-center gap-2">
    <slot name="leading" />
    <ProjectSelect v-model="projectId" allow-deselect @change="handleChange" />
    <Input
      v-model="description"
      @change="handleChange"
      :placeholder="$t('dashboard.labels.whatAreYouWorkingOn')"
    />
    <slot name="trailing" />
  </div>
</template>
