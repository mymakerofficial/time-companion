import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import type {Nullable} from "@/lib/utils";
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