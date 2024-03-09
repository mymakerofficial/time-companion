<script setup lang="ts">
import {useWorkingDurationService} from "@/services/workingDurationService";
import {useActiveDayService} from "@/services/activeDayService";
import {dateTimeZero, durationZero, formatTime, humanizeDuration, minutes, withFormat} from "@/lib/neoTime";
import {computed} from "vue";
import {isNotNull, isNull} from "@/lib/utils";
import {ArrowRight, Slash} from "lucide-vue-next";
import {useNow} from "@/composables/useNow";
import {useTimeReportService} from "@/services/timeReportService";
import DashboardSection from "@/components/dashboard/cards/DashboardSection.vue";

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
