import {defineStore} from "pinia";
import type {ReactiveCalendarDay, SerializedCalendarDay} from "@/model/calendarDay/types";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import {useProjectsStore} from "@/stores/projectsStore";
import {createDay} from "@/model/calendarDay/model";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {type ReactiveActiveDay, useActiveDay} from "@/composables/useActiveDay";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {fromSerializedDay} from "@/model/calendarDay/serializer";
import {whereDate, whereId} from "@/lib/listUtils";
import {check, isDefined} from "@/lib/utils";
import {Temporal} from "temporal-polyfill";
import {useNotifyError} from "@/composables/useNotifyError";
import {migrateCalendarDay} from "@/model/calendarDay/migrations";
import {useProjectsService} from "@/services/projectsService";

export interface CalendarStore {
  isInitialized: Readonly<Ref<boolean>>
  days: ReactiveCalendarDay[]
  activeDay: ReactiveActiveDay
  init: () => void
  addDay: (day: ReactiveCalendarDay) => void
  setActiveDay: (date: Temporal.PlainDate) => void
  forEachEvent: (block: (event: ReactiveCalendarEvent) => void) => void
  unsafeAddDay: (day: ReactiveCalendarDay) => void
  unsafeRemoveDay: (day: ReactiveCalendarDay) => void
}

interface CalendarStorageSerialized {
  version: number
  days: SerializedCalendarDay[]
}

export const useCalendarStore = defineStore('calendar', (): CalendarStore => {
  const projectsService = useProjectsService()
  const storage = useLocalStorage<CalendarStorageSerialized>('time-companion-calendar-store', { version: 0, days: [] })

  const isInitialized = ref(false)

  const days = reactive<ReactiveCalendarDay[]>([])

  /**
   * @deprecated
   */
  const activeDay = useActiveDay(days)

  function init() {
    if (isInitialized.value) {
      return
    }

    // projects need to be initialized first
    projectsService.init()

    const assets = {
      projects: projectsService.projects,
      activities: projectsService.activities,
    }

    try {
      const serialized = storage.get()

      days.push(...serialized.days.map((it: any) => createDay(fromSerializedDay(migrateCalendarDay(it, serialized.version ?? 0), assets))))

      isInitialized.value = true
    } catch (error) {
      useNotifyError({
        title: 'Failed to load calendar',
        message: 'Your calendar data could not be loaded. Data may be corrupted or missing.',
        actions: [{
          label: 'Delete calendar data',
          handler: () => {
            storage.clear()
            init()
          }
        }],
        error: error
      })
    }
  }

  function commit() {
    if (!isInitialized.value) {
      throw new Error('Tried to commit calendar store before it was initialized')
    }

    storage.set({
      version: 1,
      days: days.map((it) => it.toSerialized()),
    })
  }

  watch(() => days, commit, {deep: true})

  /**
   * @deprecated
   */
  function addDay(day: ReactiveCalendarDay) {
    if (days.some(whereId(day.id))) {
      throw new Error(`Day with id ${day.id} already exists`)
    }

    days.push(day)
  }

  /**
   * @deprecated
   */
  function setActiveDay(date: Temporal.PlainDate) {
    const existingDay = days.find(whereDate(date))

    if (isDefined(existingDay)) {
      activeDay.setActiveDay(existingDay)
      return
    }

    const newDay = createDay({
      date,
    })

    addDay(newDay)

    activeDay.setActiveDay(newDay)
  }

  /**
   * @deprecated
   */
  function forEachEvent(block: (event: ReactiveCalendarEvent) => void) {
    days.forEach((day) => day.events.forEach(block))
  }

  function unsafeAddDay(day: ReactiveCalendarDay) {
    days.push(day)
  }

  function unsafeRemoveDay(day: ReactiveCalendarDay) {
    const index = days.indexOf(day)

    check(index !== -1, `Failed to remove day ${day.id}: Day does not exist in store.`)

    days.splice(index, 1)
  }


  return {
    isInitialized: readonly(isInitialized),
    days,
    activeDay,
    init,
    addDay,
    setActiveDay,
    forEachEvent,
    unsafeAddDay,
    unsafeRemoveDay,
  }
})