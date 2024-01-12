import {defineStore} from "pinia";
import type {ReactiveCalendarDay, SerializedCalendarDay} from "@/model/calendar-day";
import {reactive, watch} from "vue";
import {useProjectsStore} from "@/stores/projects-store";
import {createDay, fromSerializedDay} from "@/model/calendar-day";
import {useLocalStorage} from "@/composables/use-local-storage";

export interface CalendarStore {
  days: ReactiveCalendarDay[]
  init: () => void
  addDay: (day: ReactiveCalendarDay) => void
}

interface CalendarStorageSerialized {
  days: SerializedCalendarDay[]
}

export const useCalendarStore = defineStore('calendar', () => {
  const projectsStore = useProjectsStore()
  const storage = useLocalStorage<CalendarStorageSerialized>('time-companion-calendar-store', { days: [] })

  const days = reactive<ReactiveCalendarDay[]>([])

  function init() {
    const serialized = storage.get()

    const assets = {
      projects: projectsStore.projects,
      activities: projectsStore.activities,
    }

    days.push(...serialized.days.map((it: any) => createDay(fromSerializedDay(it, assets))))
  }

  function store() {
    storage.set({
      days: days.map((it) => it.toSerialized()),
    })
  }

  watch(() => days, store, {deep: true})

  function addDay(day: ReactiveCalendarDay) {
    if (days.some((it) => it.id === day.id)) {
      throw new Error(`Day with id ${day.id} already exists`)
    }

    days.push(day)
  }

  return {
    days,
    init,
    addDay,
  }
})