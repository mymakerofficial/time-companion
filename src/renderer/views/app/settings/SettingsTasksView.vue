<script setup lang="ts">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import TasksTable from '@renderer/components/settings/tasks/table/TasksTable.vue'
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Tasks" />
    <TasksTable />
  </div>
</template>
