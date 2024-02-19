<script setup lang="ts">
import {computed} from "vue";
import {useCalendarStore} from "@/stores/calendarStore";
import {formatDate, formatTime, withFormat} from "@/lib/neoTime";
import {useTimeNow} from "@/composables/useNow";
import {isNull} from "@/lib/utils";

const calendarStore = useCalendarStore()

const now = useTimeNow()

const displayDateLabel = computed(() => {
  if (isNull(calendarStore.activeDay.day)) {
    return ''
  }

  return formatDate(calendarStore.activeDay.day.date, withFormat('eeee, MMMM dd'))
})

const displayTimeLabel = computed(() => {
  return formatTime(now.value)
})
</script>

<template>
  <div class="h-16 px-8 border-b border-border flex flex-row justify-between items-center gap-8">
    <h3 class="text-md font-medium tracking-wide">{{ displayDateLabel }}</h3>
    <time class="text-md font-medium tracking-wide">{{ displayTimeLabel }}</time>
  </div>
</template>