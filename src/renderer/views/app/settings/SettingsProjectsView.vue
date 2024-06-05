<script setup lang="ts">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import ProjectsTable from '@renderer/components/settings/projects/table/ProjectsTable.vue'
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.projects.title')"
      :description="$t('settings.projects.description')"
    />
    <ProjectsTable />
  </div>
</template>
