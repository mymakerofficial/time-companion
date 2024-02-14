import {defineStore} from "pinia";
import type {ReactiveCalendarDay, SerializedCalendarDay} from "@/model/calendarDay/types";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import {useProjectsStore} from "@/stores/projectsStore";
import {createDay} from "@/model/calendarDay/model";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {type ReactiveActiveDay, useActiveDay} from "@/composables/useActiveDay";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {fromSerializedDay} from "@/model/calendarDay/serializer";
import {isSameDay, today} from "@/lib/neoTime";
import {whereDate} from "@/lib/listUtils";

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
    if (isInitialized.value) {
      return
    }

    // projects need to be initialized first
    projectsStore.init()

    const assets = {
      projects: projectsStore.projects,
      activities: projectsStore.activities,
    }

    const serialized = storage.get()

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
    const existingDay = days.find(whereDate(date))

    if (existingDay) {
      activeDay.setActiveDay(existingDay)
      return
    }

    const newDay = createDay({
      date: today(),
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