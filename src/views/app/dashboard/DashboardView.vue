<script setup lang="ts">
import CalendarView from "@/components/common/calendar/CalendarView.vue";
import CalendarHeader from "@/components/dashboard/layout/CalendarHeader.vue";
import {computed} from "vue";
import CurrentEventCard from "@/components/dashboard/cards/CurrentEventCard.vue";
import RemindersContainer from "@/components/dashboard/cards/RemindersContainer.vue";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import QuickStartCard from "@/components/dashboard/cards/QuickStartCard.vue";
import ControlsHeader from "@/components/dashboard/layout/ControlsHeader.vue";
import {isNotNull, isNull} from "@/lib/utils";
import {useActiveEventService} from "@/services/activeEventService";
import {useActiveDayService} from "@/services/activeDayService";
import {useRemindersService} from "@/services/remindersService";
import EditEventCard from "@/components/dashboard/cards/EditEventCard.vue";
import {useSelectedEventService} from "@/services/selectedEventService";

const remindersService = useRemindersService()

const activeDayService = useActiveDayService()
const activeEventService = useActiveEventService()
const selectedEventService = useSelectedEventService()

const activeEventHasNoProject = computed(() => {
  return isNull(activeEventService.event?.project)
})

function handleStartEvent(shadow?: ReactiveCalendarEventShadow) {
  activeEventService.startEvent(shadow)
}
function handleStopEvent() {
  activeEventService.stopEvent()
}
function handleRemoveEvent(event: ReactiveCalendarEvent) {
  activeDayService.removeEvent(event)
}
function handleEventSelected(event: ReactiveCalendarEvent) {
  selectedEventService.setEvent(event)
}
function handleQuickStart(shadow: ReactiveCalendarEventShadow) {
  if (
      activeEventHasNoProject.value &&
      isNotNull(activeEventService.event)
  ) {
    activeEventService.event.project = shadow.project
    activeEventService.event.activity = shadow.activity
  } else {
    activeEventService.startEvent(shadow)
  }
}
</script>

<template>
  <main class="flex-grow grid grid-cols-12 h-screen">
    <section class="col-span-7 border-r border-border h-screen flex flex-col">
      <ControlsHeader />
      <div class="flex-1 overflow-y-auto">
        <CurrentEventCard
          :event="activeEventService.event"
          @start-event="handleStartEvent"
          @stop-event="handleStopEvent"
        />
        <RemindersContainer
          :reminders="remindersService.reminders"
        />
        <EditEventCard
          v-if="selectedEventService.event"
          :event="selectedEventService.event"
          @continue="handleStartEvent"
          @remove="handleRemoveEvent"
        />
        <QuickStartCard
          :icon-pencil="activeEventHasNoProject"
          @start="handleQuickStart"
        />
      </div>
    </section>
    <section class="col-span-5 flex flex-col h-screen">
      <CalendarHeader />
      <CalendarView
        v-if="activeDayService.day"
        :events="activeDayService.day.events"
        @event-selected="handleEventSelected"
      />
    </section>
  </main>
</template>
