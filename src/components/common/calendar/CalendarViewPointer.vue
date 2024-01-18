<script setup lang="ts">
import {computed} from "vue";
import {minutesToGridRows} from "@/lib/calendarUtils";
import {minutesSinceStartOfDay} from "@/lib/timeUtils";

const props = defineProps<{
  date: Date,
}>()

const containerStyle = computed(() => {
  const startOffset = 2 // due to spacing at the top
  return { gridRow: minutesToGridRows(minutesSinceStartOfDay(props.date)) + startOffset }
})
</script>

<template>
  <div class="col-start-1 col-span-full h-0.5 bg-primary z-10 border-y border-background/50 box-content" :style="containerStyle">
    <span class="absolute size-[0.6rem] rounded-full bg-primary -ml-[0.3rem] -mt-[0.225rem]" />
  </div>
</template>