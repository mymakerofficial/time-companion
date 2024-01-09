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
  },
  {
    id: uuid(),
    displayName: 'End of work',
    remindAt: timeStringToDate('17:00:00'),
    remindBeforeMins: 120,
    remindAfterMins: 30,
    buttonLabel: 'Stop working now',
    buttonAction: () => {},
    color: 'rose',
  }
])

const events = reactive<CalendarEvent[]>([
  {
    id: uuid(),
    projectDisplayName: 'Test',
    activityDisplayName: null,
    privateNote: null,
    color: 'blue',
    repeats: false,
    isBreak: false,
    startedAt: timeStringToDate('08:00:00'),
    endedAt: timeStringToDate('09:00:00'),
  },
  {
    id: uuid(),
    projectDisplayName: 'Foo Bar',
    activityDisplayName: null,
    privateNote: null,
    color: 'green',
    repeats: false,
    isBreak: false,
    startedAt: timeStringToDate('08:30:00'),
    endedAt: timeStringToDate('09:30:00'),
  }
])

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
const selectedEventId = ref<string | null>(null)

const currentEvent = computed<CalendarEvent | null>({
  get() {
    return events.find(it => it.id === currentEventId.value) || null
  },
  set(value) {
    if (value === null) {
      currentEventId.value = null
      return
    }
    const index = events.findIndex(it => it.id === currentEventId.value)
    events[index] = value
  }
})

const selectedEvent = computed<CalendarEvent | null>({
  get() {
    return events.find(it => it.id === selectedEventId.value) || null
  },
  set(value) {
    if (value === null) {
      selectedEventId.value = null
      return
    }
    const index = events.findIndex(it => it.id === selectedEventId.value)
    events[index] = value
  }
})

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

function endCurrentEvent() {
  currentEvent.value = {
    ...currentEvent.value,
    endedAt: dayjs().toDate()
  }
  currentEvent.value = null
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <HeaderBar />
    <main class="grid grid-cols-2 h-[calc(100vh-3.5rem)]">
      <section class="border-r border-border">
        <CurrentEventCard
          v-model="currentEvent"
          @create-event="createEvent"
          @end-event="() => endCurrentEvent()"
        />
        <RemindersContainer :reminders="reminders" />
        <EditEventCard
          v-if="selectedEvent"
          v-model="selectedEvent"
        />
      </section>
      <section class="flex flex-col h-[calc(100vh-3.5rem)]">
        <CalendarHeader
          :day-started-at="dayStartedAt"
          :day-predicted-end-at="dayPredictedEndAt"
        />
        <CalendarView
          :events="events"
          @event-selected="(id) => selectedEventId = id"
        />
      </section>
    </main>
  </div>
</template>
