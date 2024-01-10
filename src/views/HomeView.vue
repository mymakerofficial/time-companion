<script setup lang="ts">
import CalendarView from "@/components/calendar/CalendarView.vue";
import CalendarHeader from "@/components/CalendarHeader.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import {computed, reactive, ref} from "vue";
import {now, timeStringToDate} from "@/lib/time-utils";
import dayjs from "dayjs";
import {calendarEvent, type CalendarEvent, type CalendarReminder} from "@/lib/types";
import CurrentEventCard from "@/components/event-cards/CurrentEventCard.vue";
import EditEventCard from "@/components/event-cards/EditEventCard.vue";
import RemindersContainer from "@/components/RemindersContainer.vue";
import { v4 as uuid } from "uuid";
import {isNotNull, isNull} from "@/lib/utils";
import {firstOf} from "@/lib/list-utils";
import {useReferenceById} from "@/composables/use-reference-by-id";

const reminders = reactive<CalendarReminder[]>([
  {
    id: uuid(),
    displayName: 'Take a break',
    remindAt: timeStringToDate('12:00:00'),
    remindBeforeMinutes: 30,
    remindAfterMinutes: 30,
    buttonLabel: 'Start',
    buttonAction: () => stopCurrentEvent(),
    color: 'orange',
  },
  {
    id: uuid(),
    displayName: 'End of work',
    remindAt: timeStringToDate('17:00:00'),
    remindBeforeMinutes: 120,
    remindAfterMinutes: 30,
    buttonLabel: 'Stop working now',
    buttonAction: () => stopCurrentEvent(),
    color: 'red',
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

const workDayLengthHours = ref(8)
const workBreakLengthHours = ref(0.5)

const dayStartedAt = computed(() => {
  return firstOf(events)?.startedAt || null
})

const dayPredictedEndAt = computed(() => {
  if (isNull(dayStartedAt.value)) {
    return null
  }

  return dayjs(dayStartedAt.value).add(workDayLengthHours.value + workBreakLengthHours.value, 'hour').toDate()
})

const currentEvent = useReferenceById(events)
const selectedEvent = useReferenceById(events)

function startCurrentEvent(partialEvent?: Partial<CalendarEvent>) {
  if (isNotNull(currentEvent.value)) {
    stopCurrentEvent()
  }

  const id = uuid()

  events.push(calendarEvent({
    ...partialEvent,
    id,
    startedAt: now(),
    endedAt: null,
    privateNote: null,
  }))

  currentEvent.referenceBy(id)
}

function stopCurrentEvent() {
  if (isNull(currentEvent.value)) {
    return
  }

  currentEvent.value = {
    ...currentEvent.value,
    endedAt: now()
  }

  selectedEvent.referenceBy(currentEvent.value.id)
  currentEvent.value = null
}

function handleEventSelected(id: string) {
  selectedEvent.referenceBy(id)
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <HeaderBar />
    <main class="grid grid-cols-2 h-[calc(100vh-3.5rem)]">
      <section class="border-r border-border">
        <CurrentEventCard
          v-model="currentEvent"
          @start-event="startCurrentEvent"
          @stop-event="stopCurrentEvent"
        />
        <RemindersContainer :reminders="reminders" />
        <EditEventCard
          v-if="selectedEvent"
          v-model="selectedEvent"
          @continue="startCurrentEvent"
        />
      </section>
      <section class="flex flex-col h-[calc(100vh-3.5rem)]">
        <CalendarHeader
          :day-started-at="dayStartedAt"
          :day-predicted-end-at="dayPredictedEndAt"
        />
        <CalendarView
          :events="events"
          @event-selected="handleEventSelected"
        />
      </section>
    </main>
  </div>
</template>
