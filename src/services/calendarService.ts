import {reactive} from "vue";
import {useCalendarStore} from "@/stores/calendarStore";
import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {check} from "@/lib/utils";
import {mapReadonly} from "@/model/modelHelpers";
import {whereDate, whereId} from "@/lib/listUtils";

export interface CalendarService {
  days: ReadonlyArray<ReactiveCalendarDay>
  addDay: (day: ReactiveCalendarDay) => void
  addDays: (days: ReactiveCalendarDay[]) => void
  removeDay: (day: ReactiveCalendarDay) => void
  removeDays: (days: ReactiveCalendarDay[]) => void
  findDay: (predicate: (day: ReactiveCalendarDay) => boolean) => ReactiveCalendarDay | undefined
  forEachEvent: (block: (event: ReactiveCalendarEvent) => void) => void
}

export function useCalendarService({
  calendarStore = useCalendarStore(),
} = {}): CalendarService {
  function addDay(day: ReactiveCalendarDay) {
    check(!calendarStore.days.some(whereId(day.id)),
      `Failed to add day: Day with same id "${day.id}" already exists`
    )
    check(!calendarStore.days.some(whereDate(day.date)),
      'Failed to add day: Day with same date already exists'
    )

    calendarStore.unsafeAddDay(day)
  }

  function addDays(days: ReactiveCalendarDay[]) {
    days.forEach(addDay)
  }

  function removeDay(day: ReactiveCalendarDay) {
    check(calendarStore.days.includes(day),
      `Failed to remove day: Day with id "${day.id}" does not exist`
    )

    calendarStore.unsafeRemoveDay(day)
  }

  function removeDays(days: ReactiveCalendarDay[]) {
    days.forEach(removeDay)
  }

  function findDay(predicate: (day: ReactiveCalendarDay) => boolean) {
    return calendarStore.days.find(predicate)
  }

  function forEachEvent(block: (event: ReactiveCalendarEvent) => void) {
    calendarStore.days.forEach((day) => day.events.forEach(block))
  }

  return reactive({
    ...mapReadonly(calendarStore, [
      'days',
    ]),
    addDay,
    addDays,
    removeDay,
    removeDays,
    findDay,
    forEachEvent,
  })
}