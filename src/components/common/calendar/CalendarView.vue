<script setup lang="ts">
import dayjs from 'dayjs'
import {useNow} from "@vueuse/core";
import {formatHours, timeStringToDate} from "@/lib/timeUtils";
import CalendarViewEvent from "@/components/common/calendar/CalendarViewEvent.vue";
import CalendarViewPointer from "@/components/common/calendar/CalendarViewPointer.vue";
import CalendarViewArea from "@/components/common/calendar/CalendarViewArea.vue";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";

const props = defineProps<{
  events: ReactiveCalendarEvent[]
}>()

const emit = defineEmits<{
  eventSelected: [id: string]
}>()
//
// const now = useNow({ interval: 60000 }) // update every minute
//
// function getRowTimeLabel(row: number) {
//   const rowsPerHour = 2
//   return formatHours(row / rowsPerHour)
// }
//
// function calculateInset(event: ReactiveCalendarEvent) {
//   const start = dayjs(event.startedAt)
//
//   let inset = 0
//
//   props.events.forEach((it) => {
//     if (it.id === event.id) {
//       return
//     }
//
//     const itStart = dayjs(it.startedAt)
//     const itEnd = dayjs(it.endedAt || now.value)
//     const diff = itEnd.diff(itStart, 'minute')
//
//     const itEndPadded = diff < 12 ? itEnd.add(12 - diff, 'minute') : itEnd
//
//     if (start.isAfter(itStart) && start.isBefore(itEndPadded)) {
//       inset += 1
//     }
//   })
//
//   return inset
// }
//
// function handleClick(id: string) {
//   emit('eventSelected', id)
// }
</script>

<template>
<!--  <div class="flex-1 flex overflow-y-scroll">-->
<!--    <div class="flex w-full min-h-[124rem]">-->
<!--      <div class="w-20 border-r border-border" />-->
<!--      <div class="flex-1 grid grid-cols-1 grid-rows-1">-->
<!--        <div class="col-start-1 col-end-2 row-end-2 -ml-3 grid grid-rows-[2em_repeat(48,_minmax(0,_1fr))]">-->
<!--          <div />-->
<!--          <template v-for="i in 48">-->
<!--            <div class="border-t border-border">-->
<!--              <div v-if="i % 2 === 1" class="leading-5 text-right text-xs font-medium text-muted-foreground -ml-24 -mt-2.5 pr-5 w-24">-->
<!--                {{ getRowTimeLabel(i - 1) }}-->
<!--              </div>-->
<!--            </div>-->
<!--          </template>-->
<!--        </div>-->
<!--        <div class="relative col-start-1 col-end-2 row-end-2 mr-3 border-r border-border grid grid-rows-[2rem_repeat(288,_minmax(0,_1fr))_auto] grid-cols-12">-->
<!--          <CalendarViewArea :started-at="null" :ended-at="timeStringToDate('07:00:00')" />-->
<!--          <CalendarViewArea :started-at="timeStringToDate('18:00:00')" :ended-at="null" />-->
<!--          <CalendarViewEvent-->
<!--            v-for="event in events"-->
<!--            :key="event.id"-->
<!--            :event="event"-->
<!--            :inset="calculateInset(event)"-->
<!--            @click="handleClick(event.id)"-->
<!--          />-->
<!--          <CalendarViewPointer :date="now" />-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
</template>