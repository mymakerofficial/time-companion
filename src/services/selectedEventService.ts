import type {Nullable} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {createService} from "@/composables/createService";
import {useSelectedEventStore} from "@/stores/selectedEventStore";
import {check, isNotNull} from "@/lib/utils";
import {useActiveDayService} from "@/services/activeDayService";
import {reactive} from "vue";
import {mapReadonly} from "@/model/modelHelpers";

export interface SelectedEventService {
  readonly event: Nullable<ReactiveCalendarEvent>
  setEvent: (event: ReactiveCalendarEvent) => void
  unsetEvent: () => void
}

export const useSelectedEventService = createService<SelectedEventService>(() => {
  const selectedEventStore = useSelectedEventStore()
  const activeDayService = useActiveDayService()

  function setEvent(event: ReactiveCalendarEvent) {
    check(isNotNull(activeDayService.day),
      `Failed to set event "${event.id}" as selected event: Active day is not set.`
    )
    check(activeDayService.day!.events.includes(event),
      `Failed to set event "${event.id}" as selected event: Event is not in active day.`
    )
    check(isNotNull(event.endAt),
      `Failed to set event "${event.id}" as selected event: Event has no end date.`
    )

    selectedEventStore.unsafeSetEvent(event)
  }

  function unsetEvent() {
    selectedEventStore.unsafeSetEvent(null)
  }

  return reactive({
    ...mapReadonly(selectedEventStore, [
      'event'
    ]),
    setEvent,
    unsetEvent
  })
})