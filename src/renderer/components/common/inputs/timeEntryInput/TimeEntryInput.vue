<script setup lang="ts">
import { Input } from '@renderer/components/ui/input'
import ProjectSelect from '@renderer/components/common/inputs/projectInput/ProjectSelect.vue'
import type { Nullable } from '@shared/lib/utils/types'
import type { ProjectDto } from '@shared/model/project'

const project = defineModel<Nullable<ProjectDto>>('project', { required: true })
const description = defineModel<string>('description', { required: true })
</script>

<template>
  <div class="flex flex-row gap-2">
    <ProjectSelect v-model="project" allow-deselect />
    <Input
      v-model="description"
      :placeholder="$t('dashboard.labels.whatAreYouWorkingOn')"
    />
  </div>
</template>
