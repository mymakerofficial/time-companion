<script setup lang="ts">
import {computed} from "vue";
import {minsToGridRows} from "@/lib/calendar-utils";
import {minsSinceStartOfDay} from "@/lib/time-utils";

const props = defineProps<{
  startedAt: Date | null
  endedAt: Date | null
}>()

const containerStyle = computed(() => {
  const { startedAt, endedAt } = props

  const startOffset = 2 // due to spacing at the top
  const startRow = startedAt !== null ? minsToGridRows(minsSinceStartOfDay(startedAt)) + startOffset : 1
  const endRow = endedAt !== null ? minsToGridRows(minsSinceStartOfDay(endedAt)) + startOffset : 290
  const spanRows = endRow - startRow

  return { gridRow: `${startRow} / span ${spanRows}` }
})
</script>

<template>
  <div class="bg-secondary/50 col-start-1 col-span-full" :style="containerStyle" />
</template>