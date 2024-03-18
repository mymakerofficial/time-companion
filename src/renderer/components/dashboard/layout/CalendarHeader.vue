<script setup lang="ts">
import {computed} from "vue";
import {formatDate, formatTime, withFormat} from "@renderer/lib/neoTime";
import {useTimeNow} from "@renderer/composables/useNow";
import {isNull} from "@renderer/lib/utils";
import {useActiveDayService} from "@renderer/services/activeDayService";

const activeDayService = useActiveDayService()

const now = useTimeNow()

const displayDateLabel = computed(() => {
  if (isNull(activeDayService.day)) {
    return ''
  }

  return formatDate(activeDayService.day.date, withFormat('eeee, MMMM dd'))
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