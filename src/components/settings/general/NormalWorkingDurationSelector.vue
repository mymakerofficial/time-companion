<script setup lang="ts">
import DurationInput from "@/components/common/inputs/timeInput/DurationInput.vue";
import {useWorkingDurationService} from "@/services/workingDurationService";

const workingDurationService = useWorkingDurationService()
</script>

<template>
  <DurationInput
    v-model="workingDurationService.normalWorkingDuration"
    class="w-16"
    input-class="text-center"
  />
</template>