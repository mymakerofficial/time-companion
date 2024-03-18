<script setup lang="ts">
import {computed} from "vue";
import {durationToGridRows} from "@renderer/lib/calendarUtils";
import {vProvideColor} from "@renderer/directives/vProvideColor";
import type {ReactiveCalendarEvent} from "@renderer/model/calendarEvent/types";
import {durationBetween, durationSinceStartOfDay, formatTime, minutes, withFormat} from "@renderer/lib/neoTime";
import {isNull} from "@renderer/lib/utils";
import {useNow} from "@renderer/composables/useNow";
import {isNotEmpty} from "@renderer/lib/listUtils";
import {Slash} from "lucide-vue-next";

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
    <div @click="handleClick" v-provide-color="event.color" class="cursor-pointer absolute inset-0.5 flex rounded-md overflow-hidden bg-background min-h-3">
      <div class="flex-1 px-2 py-1 flex flex-col gap-1 bg-color text-color-foreground hover:bg-color/90">
        <div class="text-sm flex items-center gap-2 text-nowrap">
          <div class="font-medium flex items-center gap-1">
            <span>{{ event.projectDisplayName }}</span>
            <Slash v-if="isNotEmpty(event.activityDisplayName)" class="size-3" />
            <span v-if="isNotEmpty(event.activityDisplayName)">{{ event.activityDisplayName }}</span>
          </div>
          <span>{{ event.note }}</span>
        </div>
        <span class="text-xs"><time>{{ startedAtLabel }}</time> - <time>{{ endedAtLabel }}</time></span>
      </div>
    </div>
  </div>
</template>