<script setup lang="ts">
import {computed} from "vue";
import {durationToGridRows} from "@/lib/calendarUtils";
import {vProvideColor} from "@/directives/vProvideColor";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {
  durationBetween,
  durationSinceStartOfDay,
  formatTime,
  minutes,
  withFormat
} from "@/lib/neoTime";
import {isNull} from "@/lib/utils";
import {useNow} from "@/composables/useNow";

const props = defineProps<{
  event: ReactiveCalendarEvent
}>()

const emit = defineEmits<{
  click: []
}>()

const now = useNow({ interval: minutes(1) })

const containerPosition = computed(() => {
  const { startAt, endAt } = props.event

  const startOffset = 2 // due to spacing at the top
  const startRow = durationToGridRows(durationSinceStartOfDay(startAt)) + startOffset
  const spanRows = durationToGridRows(durationBetween(startAt, endAt ?? now.value))

  const minRowSpan = 1 // to prevent to small and negative spans
  if (spanRows < minRowSpan) {
    return { startRow, spanRows: minRowSpan }
  }

  return { startRow, spanRows }
})

const containerStyle = computed(() => {
  const { startRow, spanRows } = containerPosition.value

  return {
    gridRow: `${startRow} / span ${spanRows}`,
  }
})

const startedAtLabel = computed(() => {
  return formatTime(props.event.startAt, withFormat('HH:mm'))
})

const endedAtLabel = computed(() => {
  if (isNull(props.event.endAt)) {
    return 'now'
  }

  return formatTime(props.event.endAt,  withFormat('HH:mm'))
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <div class="flex relative mt-0.5 col-span-full" :style="containerStyle">
    <div @click="handleClick" class="cursor-pointer absolute inset-0.5 flex rounded-md overflow-hidden bg-background min-h-3" v-provide-color="event.color">
      <div class="flex-1 px-2 py-1 flex flex-col gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
        <div class="flex flex-row justify-between items-center">
          <h2 :data-small="containerPosition.spanRows < 2" class="space-x-2 text-sm data-[small=true]:text-xs data-[small=true]:-my-2">
            <span class="font-medium">{{ event.projectDisplayName || event.note || 'Unnamed' }}</span>
            <span v-if="!(!event.projectDisplayName && !event.activityDisplayName && event.note)">{{ event.activityDisplayName || event.note }}</span>
          </h2>
        </div>
        <p class="text-xs"><time>{{ startedAtLabel }}</time> - <time>{{ endedAtLabel }}</time></p>
        <p v-if="event.projectDisplayName && event.activityDisplayName && event.note" class="text-xs">{{ event.note }}</p>
      </div>
    </div>
  </div>
</template>