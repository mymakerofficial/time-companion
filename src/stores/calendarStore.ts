import {defineStore} from "pinia";
import type {ReactiveCalendarDay, SerializedCalendarDay} from "@/model/calendarDay";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import {useProjectsStore} from "@/stores/projectsStore";
import {createDay, fromSerializedDay} from "@/model/calendarDay";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {type ReactiveActiveDay, useActiveDay} from "@/composables/useActiveDay";
import {isSameDay} from "@/lib/timeUtils";
import dayjs from "dayjs";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent";

export interface CalendarStore {
  isInitialized: Readonly<Ref<boolean>>
  days: ReactiveCalendarDay[]
  activeDay: ReactiveActiveDay
  init: () => void
  addDay: (day: ReactiveCalendarDay) => void
  setActiveDay: (date: Date) => void
  forEachEvent: (block: (event: ReactiveCalendarEvent) => void) => void
}

interface CalendarStorageSerialized {
  days: SerializedCalendarDay[]
}

export const useCalendarStore = defineStore('calendar', (): CalendarStore => {
  const projectsStore = useProjectsStore()
  const storage = useLocalStorage<CalendarStorageSerialized>('time-companion-calendar-store', { days: [] })

  const isInitialized = ref(false)

  const days = reactive<ReactiveCalendarDay[]>([])
  const activeDay = useActiveDay(days)

  function init() {
    // reset state
    isInitialized.value = false
    days.length = 0

    // projects need to be initialized first
    projectsStore.init()

    const serialized = storage.get()

    const assets = {
      projects: projectsStore.projects,
      activities: projectsStore.activities,
    }

    days.push(...serialized.days.map((it: any) => createDay(fromSerializedDay(it, assets))))

    isInitialized.value = true
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

  function forEachEvent(block: (event: ReactiveCalendarEvent) => void) {
    days.forEach((day) => day.events.forEach(block))
  }

  return {
    isInitialized: readonly(isInitialized),
    days,
    activeDay,
    init,
    addDay,
    setActiveDay,
    forEachEvent,
  }
})