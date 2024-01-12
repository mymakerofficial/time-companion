import {defineStore} from "pinia";
import type {ReactiveCalendarDay} from "@/model/calendar-day";
import {reactive} from "vue";

export interface CalendarStore {

}

export const useCalendarStore = defineStore('calendar', () => {
  const days = reactive<ReactiveCalendarDay[]>([])
})