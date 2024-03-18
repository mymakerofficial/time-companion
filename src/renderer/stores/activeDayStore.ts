import type {ReactiveCalendarDay} from "@renderer/model/calendarDay/types";
import type {Nullable} from "@renderer/lib/utils";
import {defineStore} from "pinia";
import {ref} from "vue";

export const useActiveDayStore = defineStore('active-day', () => {
  const day = ref<Nullable<ReactiveCalendarDay>>(null)

  function unsafeSetDay(newDay: Nullable<ReactiveCalendarDay>) {
    day.value = newDay
  }

  return {
    day,
    unsafeSetDay
  }
})