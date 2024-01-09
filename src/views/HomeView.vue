<script setup lang="ts">
import CalendarView from "@/components/calendar/CalendarView.vue";
import CalendarHeader from "@/components/CalendarHeader.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import {computed, reactive, ref} from "vue";
import {timeStringToDate} from "@/lib/time-utils";
import dayjs from "dayjs";
import type {CalendarEvent, CalendarReminder} from "@/lib/types";
import CurrentEventCard from "@/components/event-cards/CurrentEventCard.vue";
import EditEventCard from "@/components/event-cards/EditEventCard.vue";
import RemindersContainer from "@/components/RemindersContainer.vue";
import { v4 as uuid } from "uuid";

const reminders = reactive<CalendarReminder[]>([
  {
    id: uuid(),
    displayName: 'Take a break',
    remindAt: timeStringToDate('12:00:00'),
    remindBeforeMins: 30,
    remindAfterMins: 30,
    buttonLabel: 'Start',
    buttonAction: () => {},
    color: 'orange',
  }
])

const events = reactive<CalendarEvent[]>([])

const workDayLengthHours = 8
const workBreakLengthHours = 0.5

const dayStartedAt = computed(() => {
  return events[0]?.startedAt || null
})

const dayPredictedEndAt = computed(() => {
  if (dayStartedAt.value === null) {
    return null
  }
  return dayjs(dayStartedAt.value).add(workDayLengthHours + workBreakLengthHours, 'hour').toDate()
})

const currentEventId = ref<string | null>(null)

function createEvent() {
  const id = uuid()

  events.push({
    id,
    projectDisplayName: null,
    activityDisplayName: null,
    privateNote: null,
    color: null,
    repeats: false,
    isBreak: false,
    startedAt: dayjs().toDate(),
    endedAt: null,
  })

  currentEventId.value = id

  return id
}

function updateEvent(displayName: string) {
  const index = events.findIndex(it => it.id === currentEventId.value)
  events[index] = {
    ...events[index],
    projectDisplayName: displayName,
  }
}

function endEvent() {
  const index = events.findIndex(it => it.id === currentEventId.value)
  events[index] = {
    ...events[index],
    endedAt: dayjs().toDate(),
  }
  currentEventId.value = null
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <HeaderBar />
    <main class="grid grid-cols-2 h-[calc(100vh-3.5rem)]">
      <section class="border-r border-border">
        <CurrentEventCard
          @create-event="createEvent"
          @update-event="updateEvent"
          @end-event="endEvent"
        />
        <RemindersContainer :reminders="reminders" />
        <EditEventCard />
      </section>
      <section class="flex flex-col h-[calc(100vh-3.5rem)]">
        <CalendarHeader
          :day-started-at="dayStartedAt"
          :day-predicted-end-at="dayPredictedEndAt"
        />
        <CalendarView :events="events" />
      </section>
    </main>
  </div>
</template>
