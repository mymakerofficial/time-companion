import {defineStore} from "pinia";
import {computed, reactive} from "vue";
import type {ReactiveCalendarReminder} from "@/model/calendar-reminder";

export interface RemindersStore {
  reminders: ReactiveCalendarReminder[]
}

export const useRemindersStore = defineStore('reminders', (): RemindersStore => {
  const reminders = reactive<ReactiveCalendarReminder[]>([])

  return {
    reminders,
  }
})