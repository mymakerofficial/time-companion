<script setup lang="ts">
import {useProjectsStore} from "@/stores/projects-store";
import SettingsHeader from "@/components/SettingsHeader.vue";

const projectsStore = useProjectsStore()
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Projects" description="Manage your projects and activities" />
    <div>
      <label class="block font-bold">Projects</label>
      <pre>{{ projectsStore.projects.map((it) => it.toSerialized()) }}</pre>
      <br />
      <label class="block font-bold">Activities</label>
      <pre>{{ projectsStore.activities.map((it) => it.toSerialized()) }}</pre>
    </div>
  </div>
</template>