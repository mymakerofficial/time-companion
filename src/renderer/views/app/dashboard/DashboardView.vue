<script setup lang="ts">
import CalendarView from '@renderer/components/common/calendar/CalendarView.vue'
import CalendarHeader from '@renderer/components/dashboard/layout/CalendarHeader.vue'
import { computed } from 'vue'
import CurrentEventCard from '@renderer/components/dashboard/cards/CurrentEventCard.vue'
import RemindersContainer from '@renderer/components/dashboard/cards/RemindersContainer.vue'
import type { ReactiveCalendarEvent } from '@renderer/model/calendarEvent/types'
import type { ReactiveCalendarEventShadow } from '@renderer/model/eventShadow/types'
import QuickStartCard from '@renderer/components/dashboard/cards/QuickStartCard.vue'
import ControlsHeader from '@renderer/components/dashboard/layout/ControlsHeader.vue'
import { isNotNull, isNull } from '@renderer/lib/utils'
import { useActiveEventService } from '@renderer/services/activeEventService'
import { useActiveDayService } from '@renderer/services/activeDayService'
import { useRemindersService } from '@renderer/services/remindersService'
import EditEventCard from '@renderer/components/dashboard/cards/EditEventCard.vue'
import { useSelectedEventService } from '@renderer/services/selectedEventService'
import WorkingDurationCard from '@renderer/components/dashboard/cards/WorkingDurationCard.vue'

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
function handleRemoveEvent(event: ReactiveCalendarEvent) {
  activeDayService.removeEvent(event)
}
function handleDeselectEvent() {
  selectedEventService.unsetEvent()
}
function handleEventSelected(event: ReactiveCalendarEvent) {
  selectedEventService.setEvent(event)
}
function handleQuickStart(shadow: ReactiveCalendarEventShadow) {
  if (activeEventHasNoProject.value && isNotNull(activeEventService.event)) {
    activeEventService.event.project = shadow.project
    activeEventService.event.activity = shadow.activity
  } else {
    activeEventService.startEvent(shadow)
  }
}
</script>

<template>
  <main class="flex-grow grid grid-cols-12">
    <section class="col-span-7 border-r border-border flex flex-col">
      <ControlsHeader />
      <div class="flex-1 overflow-y-auto">
        <CurrentEventCard />
        <EditEventCard
          v-if="selectedEventService.event"
          :event="selectedEventService.event"
          @continue="handleStartEvent"
          @remove="handleRemoveEvent"
          @dismiss="handleDeselectEvent"
        />
        <QuickStartCard
          :icon-pencil="activeEventHasNoProject"
          @start="handleQuickStart"
        />
        <RemindersContainer :reminders="remindersService.reminders" />
        <WorkingDurationCard />
      </div>
    </section>
    <section class="col-span-5 flex flex-col h-viewport">
      <CalendarHeader />
      <CalendarView
        v-if="activeDayService.day"
        :events="activeDayService.day.events"
        @event-selected="handleEventSelected"
      />
    </section>
  </main>
</template>
