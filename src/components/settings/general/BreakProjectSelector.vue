<script setup lang="ts">
import ProjectSelect from "@/components/common/inputs/projectInput/ProjectSelect.vue";
import {useWorkingDurationService} from "@/services/workingDurationService";

const workingDurationService = useWorkingDurationService();
</script>

<template>
  <ProjectSelect v-model="workingDurationService.breakProject" allow-deselect />
</template>