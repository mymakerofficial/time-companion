<script setup lang="ts">
import {computed} from "vue";
import {useNow} from "@vueuse/core";
import {formatDate} from "@/lib/time-utils";

const now = useNow({ interval: 1000 }) // update every second

const displayTimeLabel = computed(() => {
  return formatDate(now.value)
})
</script>

<template>
  <div class="px-8 py-4 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-8">
      <div>
        <h3 class="text-md font-medium tracking-wide">Today</h3>
      </div>
      <time class="text-md font-medium tracking-wide">{{ displayTimeLabel }}</time>
    </div>
  </div>
</template>