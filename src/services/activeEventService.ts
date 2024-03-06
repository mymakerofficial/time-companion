import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {Nullable} from "@/lib/utils";
import {check, isNotNull} from "@/lib/utils";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import {useActiveEventStore} from "@/stores/activeEventStore";
import {createEvent} from "@/model/calendarEvent/model";
import {now} from "@/lib/neoTime";
import {reactive} from "vue";
import {mapReadonly} from "@/model/modelHelpers";
import {useActiveDayService} from "@/services/activeDayService";
import {createService} from "@/composables/createService";
import {useSelectedEventService} from "@/services/selectedEventService";

export interface ActiveEventService {
  readonly event: Nullable<ReactiveCalendarEvent>
  setEvent: (event: ReactiveCalendarEvent) => void
  unsetEvent: () => void
  startEvent: (shadow?: ReactiveCalendarEventShadow) => ReactiveCalendarEvent
  stopEvent: () => void
}

export const useActiveEventService = createService<ActiveEventService>(() =>  {
  const activeEventStore = useActiveEventStore()
  const activeDayService = useActiveDayService()

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

  function startEvent(shadow?: ReactiveCalendarEventShadow) {
    check(isNotNull(activeDayService.day),
      "Failed to start event as active event: Active day is not set."
    )

    const event = createEvent({
      project: shadow?.project,
      activity: shadow?.activity,
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

    activeEventStore.event!.endAt = now()
    unsetEvent()
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