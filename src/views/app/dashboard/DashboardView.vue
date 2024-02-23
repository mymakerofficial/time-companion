<script setup lang="ts">
import CalendarView from "@/components/common/calendar/CalendarView.vue";
import CalendarHeader from "@/components/dashboard/layout/CalendarHeader.vue";
import {computed} from "vue";
import CurrentEventCard from "@/components/dashboard/cards/CurrentEventCard.vue";
import EditEventCard from "@/components/dashboard/cards/EditEventCard.vue";
import RemindersContainer from "@/components/dashboard/cards/RemindersContainer.vue";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import QuickStartCard from "@/components/dashboard/cards/QuickStartCard.vue";
import {useRemindersStore} from "@/stores/remidersStore";
import {useCalendarStore} from "@/stores/calendarStore";
import type {ID} from "@/lib/types";
import ControlsHeader from "@/components/dashboard/layout/ControlsHeader.vue";
import DebugDialog from "@/components/common/DebugDialog.vue";
import {isNotNull} from "@/lib/utils";

const remindersStore = useRemindersStore()
const calendarStore = useCalendarStore()

const activeEventHasNoProject = computed(() => {
  return calendarStore.activeDay.currentEvent?.project === null
})

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
function handleQuickStart(shadow: ReactiveCalendarEventShadow) {
  if (activeEventHasNoProject.value && isNotNull(calendarStore.activeDay.currentEvent)) {
    calendarStore.activeDay.currentEvent.project = shadow.project
    calendarStore.activeDay.currentEvent.activity = shadow.activity
    return
  }

  calendarStore.activeDay.startEvent(shadow)
}
</script>

<template>
  <main class="flex-grow grid grid-cols-12 h-screen">
    <section class="col-span-7 border-r border-border h-screen flex flex-col">
      <ControlsHeader />
      <div class="flex-1 overflow-y-auto">
        <CurrentEventCard
          :event="calendarStore.activeDay.currentEvent"
          @start-event="handleStartEvent"
          @stop-event="handleStopEvent"
        />
        <RemindersContainer
          :reminders="remindersStore.reminders"
        />
        <EditEventCard
          v-if="calendarStore.activeDay.selectedEvent"
          :event="calendarStore.activeDay.selectedEvent"
          @continue="handleStartEvent"
          @remove="handleRemoveEvent"
        />
        <QuickStartCard
          :icon-pencil="activeEventHasNoProject"
          @start="handleQuickStart"
        />
        <DebugDialog />
      </div>
    </section>
    <section class="col-span-5 flex flex-col h-screen">
      <CalendarHeader />
      <CalendarView
        v-if="calendarStore.activeDay.day"
        :events="calendarStore.activeDay.day.events"
        @event-selected="handleEventSelected"
      />
    </section>
  </main>
</template>
