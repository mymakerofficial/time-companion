<script setup lang="ts">
import CalendarView from "@/components/calendar/CalendarView.vue";
import CalendarHeader from "@/components/CalendarHeader.vue";
import HeaderBar from "@/components/Sidebar.vue";
import {computed} from "vue";
import {now} from "@/lib/time-utils";
import CurrentEventCard from "@/components/event-cards/CurrentEventCard.vue";
import EditEventCard from "@/components/event-cards/EditEventCard.vue";
import RemindersContainer from "@/components/RemindersContainer.vue";
import type {ReactiveCalendarEvent} from "@/model/calendar-event";
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/calendar-event-shadow";
import DayReportCard from "@/components/event-cards/DayReportCard.vue";
import QuickStartCard from "@/components/event-cards/QuickStartCard.vue";
import {useProjectsStore} from "@/stores/projects-store";
import {useRemindersStore} from "@/stores/remiders-store";
import {useCalendarStore} from "@/stores/calendar-store";
import type {ID} from "@/lib/types";
import ControlsHeader from "@/components/ControlsHeader.vue";

const projectsStore = useProjectsStore()
const remindersStore = useRemindersStore()
const calendarStore = useCalendarStore()

remindersStore.init()
calendarStore.init()

calendarStore.setActiveDay(now())

function handleStartEvent(shadow?: ReactiveCalendarEventShadow) {
  calendarStore.activeDay.startEvent(shadow)
}
function handleStopEvent() {
  calendarStore.activeDay.stopEvent()
}
function handleRemoveEvent(event: ReactiveCalendarEvent) {
  calendarStore.activeDay.day?.removeEvent(event)
}
function handleEventSelected(id: ID) {
  calendarStore.activeDay.selectEventById(id)
}

const quickAccessShadows = computed(() => {
  return projectsStore.projects
    .map((project) => createEventShadow({ project }))
    .reverse()
})

</script>

<template>
  <main class="flex-grow grid grid-cols-2 h-screen">
    <section class="border-r border-border h-full flex flex-col justify-between">
      <ControlsHeader />
      <div class="flex-1 overflow-y-auto">
        <CurrentEventCard
          :event="calendarStore.activeDay.currentEvent"
          @start-event="handleStartEvent"
          @stop-event="handleStopEvent"
        />
        <RemindersContainer :reminders="remindersStore.reminders" />
        <EditEventCard
          v-if="calendarStore.activeDay.selectedEvent"
          :event="calendarStore.activeDay.selectedEvent"
          @continue="handleStartEvent"
          @remove="handleRemoveEvent"
        />
        <QuickStartCard
          :shadows="quickAccessShadows"
          @start="handleStartEvent"
        />
      </div>
      <div>
        <DayReportCard
          v-if="calendarStore.activeDay.day"
          :report="calendarStore.activeDay.day.timeReport"
        />
      </div>
    </section>
    <section class="flex flex-col h-screen">
      <CalendarHeader />
      <CalendarView
        v-if="calendarStore.activeDay.day"
        :events="calendarStore.activeDay.day.events"
        @event-selected="handleEventSelected"
      />
    </section>
  </main>
</template>
