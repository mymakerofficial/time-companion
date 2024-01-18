import {defineStore} from "pinia";
import type {ReactiveCalendarDay, SerializedCalendarDay} from "@/model/calendarDay";
import {reactive, watch} from "vue";
import {useProjectsStore} from "@/stores/projectsStore";
import {createDay, fromSerializedDay} from "@/model/calendarDay";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {useActiveDay} from "@/composables/useActiveDay";
import type {Nullable} from "@/lib/utils";
import {isSameDay} from "@/lib/timeUtils";
import dayjs from "dayjs";

export interface CalendarStore {
  days: ReactiveCalendarDay[]
  activeDay: Nullable<ReactiveCalendarDay>
  init: () => void
  addDay: (day: ReactiveCalendarDay) => void
  setActiveDay: (date: Date) => void
}

interface CalendarStorageSerialized {
  days: SerializedCalendarDay[]
}

export const useCalendarStore = defineStore('calendar', () => {
  const projectsStore = useProjectsStore()
  const storage = useLocalStorage<CalendarStorageSerialized>('time-companion-calendar-store', { days: [] })

  const days = reactive<ReactiveCalendarDay[]>([])

  const activeDay = useActiveDay(days)

  function init() {
    // reset state
    days.length = 0

    // projects need to be initialized first
    projectsStore.init()

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

  function setActiveDay(date: Date) {
    const existingDay = days.find((it) => isSameDay(it.date, date))

    if (existingDay) {
      activeDay.setActiveDay(existingDay)
      return
    }

    const newDay = createDay({
      date: dayjs(date).startOf('day').toDate(),
    })

    addDay(newDay)

    activeDay.setActiveDay(newDay)
  }

  return {
    days,
    activeDay,
    init,
    addDay,
    setActiveDay,
  }
})