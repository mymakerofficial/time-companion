<script setup lang="ts">
import {computed} from "vue";
import {durationToGridRows} from "@/lib/calendarUtils";
import {durationSinceStartOfDay, minutes} from "@/lib/neoTime";
import {useNow} from "@/composables/useNow";

const now = useNow({ interval: minutes(1) })

const containerStyle = computed(() => {
  const startOffset = 2 // due to spacing at the top
  return { gridRow: durationToGridRows(durationSinceStartOfDay(now.value)) + startOffset }
})
</script>

<template>
  <div class="col-start-1 col-span-full h-0.5 bg-primary z-10 border-y border-background/50 box-content" :style="containerStyle">
    <span class="absolute size-[0.6rem] rounded-full bg-primary -ml-[0.3rem] -mt-[0.225rem]" />
  </div>
</template>