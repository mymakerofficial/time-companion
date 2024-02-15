<script setup lang="ts">
import {computed} from "vue";
import {minutesToGridRows} from "@/lib/calendarUtils";
import {minutesSinceStartOfDay} from "@/lib/timeUtils";
import {isNotNull, type Nullable} from "@/lib/utils";

const props = defineProps<{
  startedAt: Nullable<Date>
  endedAt: Nullable<Date>
}>()

// const containerStyle = computed(() => {
//   const { startedAt, endedAt } = props
//
//   const startOffset = 2 // due to spacing at the top
//
//   const startRow = isNotNull(startedAt) ? minutesToGridRows(minutesSinceStartOfDay(startedAt)) + startOffset : 1
//   const endRow = isNotNull(endedAt) ? minutesToGridRows(minutesSinceStartOfDay(endedAt)) + startOffset : 290
//   const spanRows = endRow - startRow
//
//   return { gridRow: `${startRow} / span ${spanRows}` }
// })
</script>

<template>
  <!--<div class="bg-secondary/50 col-start-1 col-span-full" :style="containerStyle" />-->
</template>