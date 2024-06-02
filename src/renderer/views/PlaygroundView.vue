<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import ProjectsTableSection from '@renderer/components/playground/ProjectsTableSection.vue'
import CreateProjectSection from '@renderer/components/playground/CreateProjectSection.vue'
import EditProjectSection from '@renderer/components/playground/EditProjectSection.vue'
import { ref } from 'vue'
import type { Nullable } from '@shared/lib/utils/types'

const selectedProjectId = ref<Nullable<string>>(null)
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col">
    <CreateProjectSection />
    <ProjectsTableSection
      @edit="(project) => (selectedProjectId = project.id)"
    />
    <EditProjectSection :project-id="selectedProjectId" />
  </ResponsiveContainer>
</template>
