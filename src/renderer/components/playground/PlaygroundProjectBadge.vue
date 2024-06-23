<script setup lang="ts">
import { useGetProjectById } from '@renderer/composables/queries/projects/useGetProjectById'
import { Badge } from '@renderer/components/ui/badge'

const props = defineProps<{
  projectId: string
}>()

const { data: project } = useGetProjectById(props.projectId)
</script>

<template>
  <Badge v-if="project" :color="project.color" v-text="project.displayName" />
</template>
