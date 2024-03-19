<script setup lang="ts">
import CalendarViewEvent from '@renderer/components/common/calendar/CalendarViewEvent.vue'
import CalendarViewPointer from '@renderer/components/common/calendar/CalendarViewPointer.vue'
import type { ReactiveCalendarEvent } from '@renderer/model/calendarEvent/types'
import { rowsToTime } from '@renderer/lib/calendarUtils'
import { formatTime, withFormat } from '@renderer/lib/neoTime'
import type { MaybeReadonly } from '@renderer/lib/utils'

defineProps<{
  events: MaybeReadonly<Array<ReactiveCalendarEvent>>
}>()

const emit = defineEmits<{
  eventSelected: [event: ReactiveCalendarEvent]
}>()

function getRowTimeLabel(row: number) {
  return formatTime(rowsToTime(row), withFormat('HH:mm'))
}

function handleClick(event: ReactiveCalendarEvent) {
  emit('eventSelected', event)
}
</script>

<template>
  <div class="flex-1 flex overflow-y-scroll">
    <div class="flex w-full min-h-[148rem]">
      <div class="w-20 border-r border-border" />
      <div class="flex-1 grid grid-cols-1 grid-rows-1">
        <div
          class="col-start-1 col-end-2 row-end-2 -ml-3 grid grid-rows-[2em_repeat(48,_minmax(0,_1fr))]"
        >
          <div />
          <template v-for="i in 48">
            <div class="border-t border-border">
              <div
                v-if="i % 2 === 1"
                class="leading-5 text-right -ml-24 -mt-2.5 pr-5 w-24"
              >
                <time
                  class="text-xs font-medium text-muted-foreground select-none"
                  >{{ getRowTimeLabel(i - 1) }}</time
                >
              </div>
            </div>
          </template>
        </div>
        <div
          class="relative col-start-1 col-end-2 row-end-2 mr-3 border-r border-border grid grid-rows-[2rem_repeat(288,_minmax(0,_1fr))_auto] grid-cols-1"
        >
          <CalendarViewEvent
            v-for="event in events"
            :key="event.id"
            :event="event"
            @click="handleClick(event)"
          />
          <CalendarViewPointer />
        </div>
      </div>
    </div>
  </div>
</template>
