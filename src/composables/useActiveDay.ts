import type {ReactiveCalendarDay} from "@/model/calendarDay";
import {useReferenceById} from "@/composables/useReferenceById";
import {computed, reactive} from "vue";
import type {ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";
import {isDefined, isNotNull, isNull, type Nullable} from "@/lib/utils";
import {createEvent, type ReactiveCalendarEvent} from "@/model/calendarEvent";
import {now} from "@/lib/timeUtils";
import type {ID} from "@/lib/types";
import {lastOf} from "@/lib/listUtils";

export interface ReactiveActiveDay {
  day: Nullable<ReactiveCalendarDay>
  setActiveDay: (day: ReactiveCalendarDay) => void
  currentEvent: Nullable<ReactiveCalendarEvent>
  selectedEvent: Nullable<ReactiveCalendarEvent>
  startEvent: (shadow?: ReactiveCalendarEventShadow) => void
  stopEvent: () => void
  selectEventById: (id: ID) => void
}

export function useActiveDay(days: ReactiveCalendarDay[]): ReactiveActiveDay {
  const state = reactive({
    currentEventId: null as Nullable<ID>,
    selectedEventId: null as Nullable<ID>,
  })

  const activeDay = useReferenceById(days)

  const currentEvent = useReferenceById(() => activeDay.value?.events, () => state.currentEventId)
  const selectedEvent = useReferenceById(() => activeDay.value?.events, () => state.selectedEventId)

  function setActiveDay(day: ReactiveCalendarDay) {
    activeDay.referenceBy(day.id)

    const lastNonEndedEvent = lastOf(day.events.filter(it => !it.hasEnded))
    const lastCompletedEvent = lastOf(day.events.filter(it => it.hasEnded))

    if (isDefined(lastNonEndedEvent)) {
      state.currentEventId = lastNonEndedEvent.id
    }

    if (isDefined(lastCompletedEvent)) {
      state.selectedEventId = lastCompletedEvent.id
    }
  }

  function selectEventById(id: ID) {
    if (id === state.currentEventId) {
      return
    }

    state.selectedEventId = id
  }

  function stopEvent() {
    if (isNull(activeDay.value)) {
      throw new Error('Tried to stop current event but no active day is set')
    }

    if (isNull(currentEvent.value)) {
      return
    }

    currentEvent.value.endedAt = now()

    state.selectedEventId = currentEvent.value.id
    state.currentEventId = null
  }

  function startEvent(shadow?: ReactiveCalendarEventShadow) {
    if (isNull(activeDay.value)) {
      throw new Error('Tried to start current event but no active day is set')
    }

    if (isNotNull(currentEvent.value)) {
      stopEvent()
    }

    const event = createEvent({
      ...shadow?.createEvent(),
      startedAt: now(),
    })

    activeDay.value.addEvent(event)
    state.currentEventId = event.id
  }

  return reactive({
    day: computed(() => activeDay.value),
    setActiveDay,
    currentEvent,
    selectedEvent,
    startEvent,
    stopEvent,
    selectEventById,
  })
}