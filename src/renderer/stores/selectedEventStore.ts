import type { Nullable } from '@renderer/lib/utils'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReactiveCalendarEvent } from '@renderer/model/calendarEvent/types'

export const useSelectedEventStore = defineStore('selected-event', () => {
  const event = ref<Nullable<ReactiveCalendarEvent>>(null)

  function unsafeSetEvent(newEvent: Nullable<ReactiveCalendarEvent>) {
    event.value = newEvent
  }

  return {
    event,
    unsafeSetEvent,
  }
})
