<script setup lang="ts">
import {computed} from "vue";
import {useNow, useToggle} from "@vueuse/core";
import {formatTimeDiff} from "@/lib/time-utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {isNull, type Nullable} from "@/lib/utils";

dayjs.extend(relativeTime)

const props = defineProps<{
  dayStartedAt: Nullable<Date>
}>()

const now = useNow()

const displayTimeLabel = computed(() => {
  if (isNull(props.dayStartedAt)) {
    return '00:00:00'
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
      <time class="text-md font-medium tracking-wide">{{ displayTimeLabel }}</time>
    </div>
  </div>
</template>