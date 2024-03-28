<script setup lang="ts">
import { useProjectById } from '@renderer/composables/project/useProjectById'
import { Input } from '@renderer/components/ui/input'

const props = defineProps<{
  projectId: string
}>()

const project = useProjectById(props.projectId)
</script>

<template>
  <div class="border rounded-md p-2">
    <div class="mx-2 text-xs mb-2 truncate w-36">{{ projectId }}</div>
    <Input v-model="project.displayName" />
  </div>
</template>
