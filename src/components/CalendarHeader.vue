<script setup lang="ts">
import {computed} from "vue";
import {useNow, useToggle} from "@vueuse/core";
import {formatTimeDiff} from "@/lib/time-utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime)

const props = defineProps<{
  dayStartedAt: Date | null,
  dayPredictedEndAt: Date | null
}>()

const now = useNow()

const [displayTimeLeft, toggleDisplayTimeLeft] = useToggle(false)

const displayTimeLabel = computed(() => {
  if (props.dayStartedAt === null || props.dayPredictedEndAt === null) {
    return '00:00:00'
  }

  if (displayTimeLeft.value) {
    // time between now and dayPredictedEndAt in HH:mm:ss
    return dayjs(now.value).to(props.dayPredictedEndAt)
  }

  // time between now and startedAt in HH:mm:ss
  return formatTimeDiff(props.dayStartedAt, now.value)
})
</script>

<template>
  <div class="px-8 py-4 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-8">
      <div>
        <h3 class="text-md font-medium tracking-wide">Today</h3>
      </div>
      <button @click="toggleDisplayTimeLeft()">
        <time class="text-md font-medium tracking-wide">{{ displayTimeLabel }}</time>
      </button>
    </div>
  </div>
</template>