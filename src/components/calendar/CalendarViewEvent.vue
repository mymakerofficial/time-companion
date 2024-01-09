<script setup lang="ts">
import {minsSinceStartOfDay} from "@/lib/time-utils";
import {computed} from "vue";
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import {useNow} from "@vueuse/core";
import {minsToGridRows} from "@/lib/calendar-utils";
import {Coffee, Repeat} from "lucide-vue-next";
import type {CalendarEvent} from "@/lib/types";
import {vProvideColor} from "@/directives/v-provide-color";

dayjs.extend(localizedFormat)

const props = defineProps<{
  event: CalendarEvent
  inset: number
}>()

const now = useNow()

const hasEnd = computed(() => {
  return props.event.endedAt !== null
})

const containerPosition = computed(() => {
  const { startedAt, endedAt } = props.event

  const startOffset = 2 // due to spacing at the top
  const minRowSpan = 1

  const startRow = minsToGridRows(minsSinceStartOfDay(startedAt)) + startOffset
  const spanRows = minsToGridRows(dayjs(endedAt || now.value).diff(dayjs(startedAt), 'minute'))

  if (spanRows < minRowSpan) {
    return { startRow, spanRows: minRowSpan }
  }

  return { startRow, spanRows }
})

const containerStyle = computed(() => {
  const { startRow, spanRows } = containerPosition.value
  const { inset } = props

  return {
    gridRow: `${startRow} / span ${spanRows}`,
    gridColumn: `${inset + 1} / span ${12 - inset}`
  }
})

const startedAtLabel = computed(() => {
  return dayjs(props.event.startedAt).format('HH:mm')
})

const endedAtLabel = computed(() => {
  if (!hasEnd.value) {
    return 'jetzt'
  }
  return dayjs(props.event.endedAt).format('HH:mm')
})
</script>

<template>
  <div class="flex relative mt-0.5" :style="containerStyle">
    <div class="absolute inset-0.5 flex rounded-md overflow-hidden bg-background min-h-3" v-provide-color="event.color">
      <div class="flex-1 px-2 py-1 flex flex-col gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
        <div class="flex flex-row justify-between items-center">
          <h2 :data-small="containerPosition.spanRows < 2" class="space-x-2 text-sm data-[small=true]:text-xs data-[small=true]:-my-2">
            <span class="font-medium">{{ event.projectDisplayName || 'Unnamed' }}</span>
            <span v-if="event.activityDisplayName">{{ event.activityDisplayName }}</span>
          </h2>
          <div>
            <Coffee v-if="event.isBreak" class="size-4" />
            <Repeat v-if="event.repeats" class="size-4" />
          </div>
        </div>
        <p class="text-xs"><time>{{ startedAtLabel }}</time> - <time>{{ endedAtLabel }}</time></p>
        <p class="text-xs">{{ event.privateNote }}</p>
      </div>
    </div>
  </div>
</template>