<script setup lang="ts">
import CalendarView from "@/components/calendar/CalendarView.vue";
import CalendarHeader from "@/components/CalendarHeader.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import {computed, reactive} from "vue";
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
import DayReportCard from "@/components/event-cards/DayReportCard.vue";
import QuickStartCard from "@/components/event-cards/QuickStartCard.vue";
import {useProjectsStore} from "@/stores/projects-store";
import {useRemindersStore} from "@/stores/remiders-store";
import {useTodayStore} from "@/stores/today-store";
import {useCalendarStore} from "@/stores/calendar-store";

// const activities = reactive([
//   createActivity({
//     displayName: 'Bar',
//   }),
//   createActivity({
//     displayName: 'Buzz',
//   }),
// ])

// const projects = reactive([
//   createProject({
//     displayName: 'Break',
//     color: 'orange',
//   }),
//   createProject({
//     displayName: 'Foo',
//     color: 'blue',
//   }),
//   createProject({
//     displayName: 'Fizz',
//     color: 'green',
//   }),
// ])

// const breakShadow = createEventShadow({
//   project: projects[0],
// })

// const reminders = reactive<ReactiveCalendarReminder[]>([
//   createReminder({
//     displayText: 'Take a break',
//     remindAt: timeStringToDate('12:00:00'),
//     remindMinutesBefore: 60,
//     remindMinutesAfter: 30,
//     actionLabel: 'Start',
//     onAction: () => startCurrentEvent(breakShadow),
//     color: 'orange',
//   })
// ])

const projectsStore = useProjectsStore()
const calendarStore = useCalendarStore()
const remindersStore = useRemindersStore()
const today = useTodayStore()

projectsStore.init()
calendarStore.init()
today.init()

// day.addEvent(createEvent({
//   project: projects[1],
//   activity: activities[0],
//   startedAt: timeStringToDate('08:00:00'),
//   endedAt: timeStringToDate('09:00:00'),
// }))
//
// day.addEvent(createEvent({
//   project: projects[2],
//   activity: activities[1],
//   startedAt: timeStringToDate('08:30:00'),
//   endedAt: timeStringToDate('09:30:00'),
// }))

const currentEvent = useReferenceById(today.day!.events)
const selectedEvent = useReferenceById(today.day!.events)

function startCurrentEvent(shadow?: ReactiveCalendarEventShadow) {
  if (isNotNull(currentEvent.value)) {
    stopCurrentEvent()
  }

  const event = createEvent({
    ...shadow?.createEvent(),
    startedAt: now(),
  })

  today.day!.addEvent(event)
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
  today.day!.removeEvent(event)
}

// const quickAccessShadows = computed(() => {
//   return projects
//     .filter((it) => it.id !== currentEvent.value?.project?.id)
//     .map((project) => createEventShadow({ project }))
//     .reverse()
// })
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <HeaderBar />
    <main class="grid grid-cols-2 h-[calc(100vh-3.5rem)]">
      <section class="border-r border-border h-[calc(100vh-3.5rem)] flex flex-col justify-between">
        <div class="flex-1 overflow-y-auto">
          <CurrentEventCard
            :event="currentEvent"
            @start-event="startCurrentEvent"
            @stop-event="stopCurrentEvent"
          />
          <RemindersContainer :reminders="remindersStore.reminders" />
          <EditEventCard
            v-if="selectedEvent"
            :event="selectedEvent"
            @continue="startCurrentEvent"
            @remove="handleRemoveEvent"
          />
          <!--<QuickStartCard :shadows="quickAccessShadows" @start="startCurrentEvent" />-->
          <pre>{{ today.day.toSerialized() }}</pre>
        </div>
        <div>
          <DayReportCard :report="today.day!.timeReport" />
        </div>
      </section>
      <section class="flex flex-col h-[calc(100vh-3.5rem)]">
        <CalendarHeader />
        <CalendarView
          :events="today.day!.events"
          @event-selected="handleEventSelected"
        />
      </section>
    </main>
  </div>
</template>
