<script setup lang="ts">
import CalendarView from "@/components/calendar/CalendarView.vue";
import CalendarHeader from "@/components/CalendarHeader.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import {reactive} from "vue";
import {now, timeStringToDate} from "@/lib/time-utils";
import dayjs from "dayjs";
import CurrentEventCard from "@/components/event-cards/CurrentEventCard.vue";
import EditEventCard from "@/components/event-cards/EditEventCard.vue";
import RemindersContainer from "@/components/RemindersContainer.vue";
import {isNotNull, isNull} from "@/lib/utils";
import {useReferenceById} from "@/composables/use-reference-by-id";
import {createReminder, type ReactiveCalendarReminder} from "@/model/calendar-reminder";
import {createEvent, type ReactiveCalendarEvent} from "@/model/calendar-event";
import {createProject} from "@/model/project";
import {createActivity} from "@/model/activity";
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/calendar-event-shadow";
import {createDay} from "@/model/calendar-day";

const activities = reactive([
  createActivity({
    displayName: 'Bar',
  }),
  createActivity({
    displayName: 'Buzz',
  }),
])

const projects = reactive([
  createProject({
    displayName: 'Break',
    color: 'orange',
  }),
  createProject({
    displayName: 'Foo',
    color: 'blue',
  }),
  createProject({
    displayName: 'Fizz',
    color: 'green',
  }),
])

const breakShadow = createEventShadow({
  project: projects[0],
})

const reminders = reactive<ReactiveCalendarReminder[]>([
  createReminder({
    displayText: 'Take a break',
    remindAt: timeStringToDate('12:00:00'),
    remindMinutesBefore: 60,
    remindMinutesAfter: 30,
    actionLabel: 'Start',
    onAction: () => startCurrentEvent(breakShadow),
    color: 'orange',
  })
])

const day = createDay({
  date: dayjs().startOf('day').toDate(),
})

day.addEvent(createEvent({
  project: projects[1],
  activity: activities[0],
  startedAt: timeStringToDate('08:00:00'),
  endedAt: timeStringToDate('09:00:00'),
}))

day.addEvent(createEvent({
  project: projects[2],
  activity: activities[1],
  startedAt: timeStringToDate('08:30:00'),
  endedAt: timeStringToDate('09:30:00'),
}))

const currentEvent = useReferenceById(day.events)
const selectedEvent = useReferenceById(day.events)

function startCurrentEvent(shadow?: ReactiveCalendarEventShadow) {
  if (isNotNull(currentEvent.value)) {
    stopCurrentEvent()
  }

  const event = createEvent({
    ...shadow?.createEvent(),
    startedAt: now(),
  })

  day.addEvent(event)
  currentEvent.referenceBy(event.id)
}

function stopCurrentEvent() {
  if (isNull(currentEvent.value)) {
    return
  }

  currentEvent.value.endedAt = now()

  selectedEvent.referenceBy(currentEvent.value.id)
  currentEvent.value = null
}

function handleEventSelected(id: string) {
  if (id === currentEvent.value?.id) {
    return
  }

  selectedEvent.referenceBy(id)
}

function handleRemoveEvent(event: ReactiveCalendarEvent) {
  day.removeEvent(event)
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <HeaderBar />
    <main class="grid grid-cols-2 h-[calc(100vh-3.5rem)]">
      <section class="border-r border-border">
        <CurrentEventCard
          :projects="projects"
          :activities="activities"
          :event="currentEvent"
          @start-event="startCurrentEvent"
          @stop-event="stopCurrentEvent"
        />
        <RemindersContainer :reminders="reminders" />
        <EditEventCard
          v-if="selectedEvent"
          :projects="projects"
          :activities="activities"
          :event="selectedEvent"
          @continue="startCurrentEvent"
          @remove="handleRemoveEvent"
        />
      </section>
      <section class="flex flex-col h-[calc(100vh-3.5rem)]">
        <CalendarHeader
          :day-started-at="day.startedAt"
        />
        <CalendarView
          :events="day.events"
          @event-selected="handleEventSelected"
        />
      </section>
    </main>
  </div>
</template>
