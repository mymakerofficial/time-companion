<script setup lang="ts">
import DurationInput from '@renderer/components/common/inputs/timeInput/DurationInput.vue'
import { useWorkingDurationService } from '@renderer/services/workingDurationService'
import { Clock } from 'lucide-vue-next'

const workingDurationService = useWorkingDurationService()
</script>

<template>
  <DurationInput
    v-model="workingDurationService.normalBreakDuration"
    v-slot:leading
  >
    <Clock class="mx-3 size-4 text-muted-foreground" />
  </DurationInput>
</template>
