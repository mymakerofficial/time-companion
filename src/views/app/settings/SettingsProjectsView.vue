<script setup lang="tsx">
import {useProjectsStore} from "@/stores/projectsStore";
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import ProjectsTable from "@/components/settings/projects/ProjectsTable.vue";

const projectsStore = useProjectsStore()
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Projects" description="Manage your projects and activities" />
    <ProjectsTable :projects="projectsStore.projects" />
  </div>
</template>