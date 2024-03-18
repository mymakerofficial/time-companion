<script setup lang="ts">
import {useWorkingDurationService} from "@renderer/services/workingDurationService";
import {useActiveDayService} from "@renderer/services/activeDayService";
import {dateTimeZero, durationZero, formatTime, humanizeDuration, minutes, withFormat} from "@renderer/lib/neoTime";
import {computed} from "vue";
import {isNotNull, isNull} from "@renderer/lib/utils";
import {ArrowRight} from "lucide-vue-next";
import {useNow} from "@renderer/composables/useNow";
import {useTimeReportService} from "@renderer/services/timeReportService";
import DashboardSection from "@renderer/components/dashboard/cards/DashboardSection.vue";

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
  <DashboardSection>
    <div class="flex flex-col gap-6 my-2 mx-4">
      <div class="flex justify-between items-center gap-4">
        <h3 class="text-sm font-medium">Time left</h3>
        <div class="flex items-center gap-4">
          <time class="text-sm font-medium">{{ durationLeftFormatted }}</time>
          <ArrowRight v-if="isNotNull(predictedEnd)" class="size-4 text-muted-foreground" />
          <time v-if="isNotNull(predictedEnd)" class="text-sm font-medium">{{ predictedEndFormatted }}</time>
        </div>
      </div>
      <div class="flex justify-between items-center gap-4">
        <h3 class="text-sm font-medium">Worked time</h3>
        <div class="flex items-center gap-4">
          <time class="text-sm font-medium">{{ durationWorkedFormatted }}</time>
        </div>
      </div>
    </div>
  </DashboardSection>
</template>
