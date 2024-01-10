<script setup lang="ts">
import CalendarView from "@/components/calendar/CalendarView.vue";
import CalendarHeader from "@/components/CalendarHeader.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import {computed, reactive, ref} from "vue";
import {now, timeStringToDate} from "@/lib/time-utils";
import dayjs from "dayjs";
import CurrentEventCard from "@/components/event-cards/CurrentEventCard.vue";
import EditEventCard from "@/components/event-cards/EditEventCard.vue";
import RemindersContainer from "@/components/RemindersContainer.vue";
import {isNotNull, isNull} from "@/lib/utils";
import {firstOf} from "@/lib/list-utils";
import {useReferenceById} from "@/composables/use-reference-by-id";
import {createReminder, type ReactiveCalendarReminder} from "@/model/calendar-reminder";
import {createEvent, type ReactiveCalendarEvent} from "@/model/calendar-event";
import {createProject} from "@/model/project";
import {createActivity, type ReactiveActivity} from "@/model/activity";

const breakActivity = createActivity({
  project: createProject({
    displayName: 'Break',
    color: 'orange',
  }),
})

const activities = reactive<ReactiveActivity[]>([
  breakActivity,
  createActivity({
    project: createProject({
      displayName: 'Foo Bar',
      color: 'blue',
    }),
  }),
  createActivity({
    project: createProject({
      displayName: 'Fizz Buzz',
      color: 'green',
    }),
  }),
])

const reminders = reactive<ReactiveCalendarReminder[]>([
  createReminder({
    displayText: 'Take a break',
    remindAt: timeStringToDate('15:00:00'),
    remindMinutesBefore: 60,
    remindMinutesAfter: 30,
    actionLabel: 'Start',
    onAction: () => startCurrentEvent(breakActivity),
    color: 'orange',
  })
])

const events = reactive<ReactiveCalendarEvent[]>([
  createEvent({
    activity: activities[1],
    startedAt: timeStringToDate('08:00:00'),
    endedAt: timeStringToDate('09:00:00'),
  }),
  createEvent({
    activity: activities[2],
    startedAt: timeStringToDate('08:30:00'),
    endedAt: timeStringToDate('09:30:00'),
  })
])

const config = reactive({
  workDayLengthHours: 8,
  workBreakLengthHours: 0.5,
})

const dayStartedAt = computed(() => {
  return firstOf(events)?.startedAt || null
})

const dayPredictedEndAt = computed(() => {
  if (isNull(dayStartedAt.value)) {
    return null
  }

  return dayjs(dayStartedAt.value).add(config.workDayLengthHours + config.workBreakLengthHours, 'hour').toDate()
})

const currentEvent = useReferenceById(events)
const selectedEvent = useReferenceById(events)

function startCurrentEvent(activity?: ReactiveActivity) {
  if (isNotNull(currentEvent.value)) {
    stopCurrentEvent()
  }

  const event = createEvent({
    activity,
    startedAt: now(),
  })

  events.push(event)
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
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <HeaderBar />
    <main class="grid grid-cols-2 h-[calc(100vh-3.5rem)]">
      <section class="border-r border-border">
        <CurrentEventCard
          :event="currentEvent"
          @start-event="startCurrentEvent"
          @stop-event="stopCurrentEvent"
        />
        <RemindersContainer :reminders="reminders" />
        <EditEventCard
          v-if="selectedEvent"
          :event="selectedEvent"
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
