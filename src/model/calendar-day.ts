import type {HasId, ID} from "@/lib/types";
import type {ReactiveCalendarEvent} from "@/model/calendar-event";
import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import {firstOf} from "@/lib/list-utils";
import {createTimeReport, type ReactiveTimeReport} from "@/model/time-report";
import type {Nullable} from "@/lib/utils";

export interface ReactiveCalendarDay extends Readonly<HasId> {
  readonly date: Date
  readonly events: ReactiveCalendarEvent[]
  readonly timeReport: ReactiveTimeReport
  readonly startedAt: Nullable<Date>
  addEvent: (event: ReactiveCalendarEvent) => void
  removeEvent: (event: ReactiveCalendarEvent) => void
}

export interface CalendarDayInit {
  id?: ID
  date: Date
  events?: ReactiveCalendarEvent[]
}

export function createDay(init: CalendarDayInit): ReactiveCalendarDay {
  const config = reactive({
    id: init.id ?? uuid(),
    date: init.date,
  })

  const inherits = reactive({
    events: init.events ?? [],
  })

  const timeReport = createTimeReport({
    date: config.date,
    events: inherits.events,
  })

  const startedAt = computed(() => firstOf(inherits.events)?.startedAt || null)

  function addEvent(event: ReactiveCalendarEvent) {
    inherits.events.push(event)
  }

  function removeEvent(event: ReactiveCalendarEvent) {
    const index = inherits.events.findIndex((it) => it.id === event.id)
    if (index >= 0) {
      inherits.events.splice(index, 1)
    }
  }

  return reactive({
    id: computed(() => config.id),
    date: computed(() => config.date),
    //
    events: computed(() => inherits.events),
    //
    timeReport: computed(() => timeReport),
    //
    startedAt: computed(() => startedAt.value),
    //
    addEvent,
    removeEvent,
  })
}