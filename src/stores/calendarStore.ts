import {defineStore} from "pinia";
import type {ReactiveCalendarDay, SerializedCalendarDay} from "@/model/calendarDay/types";
import {reactive, watch} from "vue";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {check} from "@/lib/utils";

export interface CalendarStore {
  days: ReactiveCalendarDay[]
  getSerializedStorage: () => CalendarStorageSerialized
  unsafeAddDay: (day: ReactiveCalendarDay) => void
  unsafeRemoveDay: (day: ReactiveCalendarDay) => void
}

interface CalendarStorageSerialized {
  version: number
  days: SerializedCalendarDay[]
}

export const useCalendarStore = defineStore('calendar', (): CalendarStore => {
  const storage = useLocalStorage<CalendarStorageSerialized>('time-companion-calendar-store', { version: 0, days: [] })

  const days = reactive<ReactiveCalendarDay[]>([])

  function commit() {
    storage.set({
      version: 1,
      days: days.map((it) => it.toSerialized()),
    })
  }

  watch(() => days, commit, {deep: true})

  function getSerializedStorage() {
    return storage.get();
  }

  function unsafeAddDay(day: ReactiveCalendarDay) {
    days.push(day)
  }

  function unsafeRemoveDay(day: ReactiveCalendarDay) {
    const index = days.indexOf(day)

    check(index !== -1,
      `Failed to remove day ${day.id}: Day does not exist in store.`
    )

    days.splice(index, 1)
  }


  return {
    days,
    getSerializedStorage,
    unsafeAddDay,
    unsafeRemoveDay,
  }
})