<script setup lang="ts">
import {useWorkingDurationService} from "@/services/workingDurationService";
import {useActiveDayService} from "@/services/activeDayService";
import {dateTimeZero, durationZero, formatTime, humanizeDuration, withFormat} from "@/lib/neoTime";
import {computed} from "vue";
import {isNotNull, isNull} from "@/lib/utils";
import {ArrowRight} from "lucide-vue-next";

const workingDurationService = useWorkingDurationService()
const activeDayService = useActiveDayService()

const durationLeft = computed(() => {
  if (isNull(activeDayService.day)) {
    return durationZero()
  }

  return workingDurationService.getDurationLeftOnDay(activeDayService.day)
})

const predictedEnd = computed(() => {
  if (isNull(activeDayService.day)) {
    return dateTimeZero()
  }

  return workingDurationService.getPredictedEndOfDay(activeDayService.day)
})

const durationLeftFormatted = computed(() => {
  return humanizeDuration(durationLeft.value)
})

const predictedEndFormatted = computed(() => {
  if (isNull(predictedEnd.value)) {
    return ''
  }

  return formatTime(predictedEnd.value, withFormat('HH:mm'))
})
</script>

<template>
  <div class="p-8 border-b border-border">
    <div class="flex flex-row justify-end items-center gap-4">
      <div class="flex flex-row items-center gap-2">
        <time>{{ durationLeftFormatted }}</time>
        <ArrowRight v-if="isNotNull(predictedEnd)" class="size-4 text-muted-foreground" />
        <time v-if="isNotNull(predictedEnd)">{{ predictedEndFormatted }}</time>
      </div>
    </div>
  </div>
</template>
