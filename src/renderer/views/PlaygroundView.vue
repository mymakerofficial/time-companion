<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import { projectService } from '@renderer/factory/service/projectService'
import { computedAsync } from '@vueuse/core'

const projects = computedAsync(async () => {
  return await projectService().getProjects()
}, [])
</script>

<template>
  <ResponsiveContainer class="my-14">
    <pre>{{ projects }}</pre>
  </ResponsiveContainer>
</template>
