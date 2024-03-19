import type { ReactiveCalendarDay } from '@renderer/model/calendarDay/types'
import { Temporal } from 'temporal-polyfill'
import type { Nullable } from '@renderer/lib/utils'
import { check, isDefined, isNotNull, isNull } from '@renderer/lib/utils'
import { useActiveDayStore } from '@renderer/stores/activeDayStore'
import { lastOf, whereDate } from '@renderer/lib/listUtils'
import { createDay } from '@renderer/model/calendarDay/model'
import { useCalendarService } from '@renderer/services/calendarService'
import { reactive } from 'vue'
import { mapReadonly } from '@renderer/model/modelHelpers'
import { createService } from '@renderer/composables/createService'
import { useActiveEventService } from '@renderer/services/activeEventService'
import type { ReactiveCalendarEvent } from '@renderer/model/calendarEvent/types'

export interface ActiveDayService {
  readonly day: Nullable<ReactiveCalendarDay>
  setDay: (day: ReactiveCalendarDay) => void
  unsetDay: () => void
  setByDate: (date: Temporal.PlainDate) => ReactiveCalendarDay
  addEvent: (event: ReactiveCalendarEvent) => void
  removeEvent: (event: ReactiveCalendarEvent) => void
  getLastRunningEvent: () => Nullable<ReactiveCalendarEvent>
  getLastCompletedEvent: () => Nullable<ReactiveCalendarEvent>
}

export const useActiveDayService = createService<ActiveDayService>(() => {
  const activeDayStore = useActiveDayStore()
  const calendarService = useCalendarService()

  function setDay(day: ReactiveCalendarDay) {
    check(
      calendarService.days.includes(day),
      'Failed to set day as active day. Day is not in calendar.',
    )

    activeDayStore.unsafeSetDay(day)

    const lastRunningEvent = getLastRunningEvent()

    if (isNotNull(lastRunningEvent)) {
      useActiveEventService().setEvent(lastRunningEvent)
    }
  }

  function unsetDay() {
    activeDayStore.unsafeSetDay(null)
    useActiveEventService().unsetEvent()
  }

  function setByDate(date: Temporal.PlainDate) {
    const existingDay = calendarService.findDay(whereDate(date))

    if (isDefined(existingDay)) {
      setDay(existingDay)
      return existingDay
    }

    const newDay = createDay({
      date,
    })

    calendarService.addDay(newDay)
    setDay(newDay)
    return newDay
  }

  function addEvent(event: ReactiveCalendarEvent) {
    check(
      isNotNull(activeDayStore.day),
      'Failed to add event to active day: Active day is not set.',
    )

    calendarService.addEventToDay(activeDayStore.day!, event)
  }

  function removeEvent(event: ReactiveCalendarEvent) {
    check(
      isNotNull(activeDayStore.day),
      'Failed to remove event from active day: Active day is not set.',
    )

    calendarService.removeEventFromDay(activeDayStore.day!, event)
  }

  function getLastRunningEvent(): Nullable<ReactiveCalendarEvent> {
    if (isNull(activeDayStore.day)) {
      return null
    }

    return (
      lastOf(activeDayStore.day.events.filter((it) => isNull(it.endAt))) ?? null
    )
  }

  function getLastCompletedEvent(): Nullable<ReactiveCalendarEvent> {
    if (isNull(activeDayStore.day)) {
      return null
    }

    return (
      lastOf(activeDayStore.day.events.filter((it) => isNotNull(it.endAt))) ??
      null
    )
  }

  return reactive({
    ...mapReadonly(activeDayStore, ['day']),
    setDay,
    unsetDay,
    setByDate,
    addEvent,
    removeEvent,
    getLastRunningEvent,
    getLastCompletedEvent,
  })
})
