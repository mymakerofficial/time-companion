import type {Nullable} from "@/lib/utils";
import {defineStore} from "pinia";
import {ref} from "vue";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";

export interface ActiveEventStore {
  event: Nullable<ReactiveCalendarEvent>
  unsafeSetEvent: (newEvent: Nullable<ReactiveCalendarEvent>) => void
}

export const useActiveEventStore = defineStore('active-event', () => {
  const event = ref<Nullable<ReactiveCalendarEvent>>(null)

  function unsafeSetEvent(newEvent: Nullable<ReactiveCalendarEvent>) {
    event.value = newEvent
  }

  return {
    event,
    unsafeSetEvent
  }
})