import type {CalendarEventInit, ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {Nullable} from "@/lib/utils";
import {check, isNotNull} from "@/lib/utils";
import {useActiveEventStore} from "@/stores/activeEventStore";
import {createEvent} from "@/model/calendarEvent/model";
import {compareDuration, formatDurationIso, now, parseDuration} from "@/lib/neoTime";
import {reactive} from "vue";
import {mapReadonly} from "@/model/modelHelpers";
import {useActiveDayService} from "@/services/activeDayService";
import {createService} from "@/composables/createService";
import {useSettingsStore} from "@/stores/settingsStore";

export type StartEventProps = Pick<CalendarEventInit, 'project' | 'activity' | 'note'>

export interface ActiveEventService {
  readonly event: Nullable<ReactiveCalendarEvent>
  setEvent: (event: ReactiveCalendarEvent) => void
  unsetEvent: () => void
  startEvent: (partialEvent?: StartEventProps) => ReactiveCalendarEvent
  stopEvent: () => void
}

export const useActiveEventService = createService<ActiveEventService>(() =>  {
  const activeEventStore = useActiveEventStore()
  const activeDayService = useActiveDayService()
  const settings = useSettingsStore()

  const minimumDuration = settings.getValue('minimumEventDuration', {
    get: parseDuration,
    set: formatDurationIso,
  })

  function setEvent(event: ReactiveCalendarEvent) {
    check(isNotNull(activeDayService.day),
      "Failed to set event as active event: Active day is not set."
    )
    check(activeDayService.day!.events.includes(event),
      "Failed to set event as active event: Event is not in active day."
    )

    if (isNotNull(activeEventStore.event)) {
      stopEvent()
    }

    activeEventStore.unsafeSetEvent(event)
  }

  function unsetEvent() {
    check(isNotNull(activeEventStore.event),
      "Failed to unset active event: No active event."
    )

    activeEventStore.unsafeSetEvent(null)
  }

  function startEvent(partialEvent?: StartEventProps) {
    check(isNotNull(activeDayService.day),
      "Failed to start event as active event: Active day is not set."
    )

    const event = createEvent({
      ...partialEvent,
      startAt: now(),
    })

    activeDayService.addEvent(event)
    setEvent(event)
    return event
  }

  function stopEvent() {
    check(isNotNull(activeEventStore.event),
      "Failed to stop active event: No active event."
    )

    const event = activeEventStore.event!

    event.endAt = now()
    unsetEvent()

    if (compareDuration(event.duration, minimumDuration.value) < 0) {
      activeDayService.removeEvent(event)
    }
  }

  return reactive({
    ...mapReadonly(activeEventStore, [
      "event"
    ]),
    setEvent,
    unsetEvent,
    startEvent,
    stopEvent,
  })
})