import {reactive} from "vue";
import {useCalendarStore} from "@/stores/calendarStore";
import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {check, type Optional} from "@/lib/utils";
import {mapReadonly} from "@/model/modelHelpers";
import {whereDate, whereId} from "@/lib/listUtils";
import {createService} from "@/composables/createService";
import {useInitialize} from "@/composables/useInitialize";
import {useProjectsService} from "@/services/projectsService";
import {migrateCalendarDay} from "@/model/calendarDay/migrations";
import {createDay} from "@/model/calendarDay/model";
import {fromSerializedDay} from "@/model/calendarDay/serializer";
import {useActiveEventService} from "@/services/activeEventService";
import {useSelectedEventService} from "@/services/selectedEventService";
import {useActiveDayService} from "@/services/activeDayService";

export interface CalendarService {
  days: ReadonlyArray<ReactiveCalendarDay>
  init: () => void
  addDay: (day: ReactiveCalendarDay) => void
  addDays: (days: ReactiveCalendarDay[]) => void
  removeDay: (day: ReactiveCalendarDay) => void
  removeDays: (days: ReactiveCalendarDay[]) => void
  addEventToDay: (day: ReactiveCalendarDay, event: ReactiveCalendarEvent) => void
  removeEventFromDay: (day: ReactiveCalendarDay, event: ReactiveCalendarEvent) => void
  findDay: (predicate: (day: ReactiveCalendarDay) => boolean) => Optional<ReactiveCalendarDay>
  forEachEvent: (block: (event: ReactiveCalendarEvent) => void) => void
}

export const useCalendarService = createService<CalendarService>(() => {
  const calendarStore = useCalendarStore()

  const { init } = useInitialize(() => {
    const projectsService = useProjectsService()
    projectsService.init()

    const assets = {
      projects: projectsService.projects,
      activities: projectsService.activities
    }

    const serialized = calendarStore.getSerializedStorage()

    const version = serialized.version ?? 0

    const days = serialized.days
      .map((it) => migrateCalendarDay(it, version))
      .map((it) => createDay(fromSerializedDay(it, assets)))

    addDays(days)
  })

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

  function addEventToDay(day: ReactiveCalendarDay, event: ReactiveCalendarEvent) {
    check(calendarStore.days.includes(day),
      `Failed to add event to day: Day with id "${day.id}" does not exist`
    )

    day.unsafeAddEvent(event)
  }

  function removeEventFromDay(day: ReactiveCalendarDay, event: ReactiveCalendarEvent) {
    check(calendarStore.days.includes(day),
      `Failed to remove event from day: Day with id "${day.id}" does not exist`
    )
    check(useActiveEventService().event !== event,
      `Failed to remove event "${event.id}" from day "${day.id}": Event is active event`
    )

    day.unsafeRemoveEvent(event)

    // TODO move to selectedEventService via event bus
    if (useSelectedEventService().event === event) {
      const lastCompletedEvent = useActiveDayService().getLastCompletedEvent()

      if (lastCompletedEvent) {
        useSelectedEventService().setEvent(lastCompletedEvent)
      } else {
        useSelectedEventService().unsetEvent()
      }
    }
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
    init,
    addDay,
    addDays,
    removeDay,
    removeDays,
    addEventToDay,
    removeEventFromDay,
    findDay,
    forEachEvent,
  })
})