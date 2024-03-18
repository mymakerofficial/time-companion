<script setup lang="ts">
import {useWorkingDurationService} from "@renderer/services/workingDurationService";
import ProjectSelect from "@renderer/components/common/inputs/projectInput/ProjectSelect.vue";

const workingDurationService = useWorkingDurationService();
</script>

<template>
  <ProjectSelect
    v-model="workingDurationService.breakProject"
    :filter="(project) => !project.isBillable"
    allow-deselect
    trigger-class="w-full"
  />
</template>