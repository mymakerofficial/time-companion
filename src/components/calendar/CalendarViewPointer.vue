<script setup lang="ts">
import {computed} from "vue";
import {minsToGridRows} from "@/lib/calendar-utils";
import {minsSinceStartOfDay} from "@/lib/time-utils";

const props = defineProps<{
  date: Date,
}>()

const containerStyle = computed(() => {
  const startOffset = 2 // due to spacing at the top
  return { gridRow: minsToGridRows(minsSinceStartOfDay(props.date)) + startOffset }
})
</script>

<template>
  <div class="col-start-1 col-span-full border-t-2 border-primary z-10" :style="containerStyle">
    <span class="absolute size-[0.6rem] rounded-full bg-primary -ml-[0.3rem] -mt-[0.35rem]" />
  </div>
</template>