<script setup lang="ts">
import {useWorkingDurationService} from "@/services/workingDurationService";
import {useActiveDayService} from "@/services/activeDayService";
import {dateTimeZero, durationZero, formatTime, humanizeDuration, minutes, withFormat} from "@/lib/neoTime";
import {computed} from "vue";
import {isNotNull, isNull} from "@/lib/utils";
import {ArrowRight, Slash} from "lucide-vue-next";
import {useNow} from "@/composables/useNow";
import {useTimeReportService} from "@/services/timeReportService";

const workingDurationService = useWorkingDurationService()
const activeDayService = useActiveDayService()
const timeReportService = useTimeReportService()

const now = useNow({
  interval: minutes()
})

const durationWorked = computed(() => {
  if (isNull(activeDayService.day)) {
    return durationZero()
  }

  const { totalBillableDuration } = timeReportService.getDayTimeReport(activeDayService.day, {
    endAtFallback: now.value
  })

  return totalBillableDuration
})

const durationNormal = computed(() => {
  return workingDurationService.normalTotalDuration
})

const durationLeft = computed(() => {
  if (isNull(activeDayService.day)) {
    return durationZero()
  }

  return workingDurationService.getDurationLeftOnDay(activeDayService.day, now.value)
})

const predictedEnd = computed(() => {
  if (isNull(activeDayService.day)) {
    return dateTimeZero()
  }

  return workingDurationService.getPredictedEndOfDay(activeDayService.day)
})

const durationWorkedFormatted = computed(() => {
  return humanizeDuration(durationWorked.value)
})

const durationNormalFormatted = computed(() => {
  return humanizeDuration(durationNormal.value)
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
    <div class="flex justify-between items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground">Worked time</span>
        <time class="font-medium">{{ durationWorkedFormatted }}</time>
        <Slash class="size-4 text-muted-foreground" />
        <time class="font-medium">{{ durationNormalFormatted }}</time>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground">Time left</span>
        <time class="font-medium">{{ durationLeftFormatted }}</time>
        <ArrowRight v-if="isNotNull(predictedEnd)" class="size-4 text-muted-foreground" />
        <time v-if="isNotNull(predictedEnd)" class="font-medium">{{ predictedEndFormatted }}</time>
      </div>
    </div>
  </div>
</template>
