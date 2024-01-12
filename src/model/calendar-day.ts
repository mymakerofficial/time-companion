import type {HasId, ID} from "@/lib/types";
import type {EventDeserializationAssets, ReactiveCalendarEvent, SerializedCalendarEvent} from "@/model/calendar-event";
import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import {firstOf} from "@/lib/list-utils";
import {createTimeReport, type ReactiveTimeReport} from "@/model/time-report";
import type {Nullable} from "@/lib/utils";
import {formatDate, parseDate} from "@/lib/time-utils";
import {createEvent, fromSerializedEvent} from "@/model/calendar-event";

const DATE_FORMAT = 'YYYY-MM-DD'

export interface SerializedCalendarDay {
  id: string
  date: string // YYYY-MM-DD
  events: SerializedCalendarEvent[]
}

export interface ReactiveCalendarDay extends Readonly<HasId> {
  readonly date: Date
  readonly events: ReactiveCalendarEvent[]
  readonly timeReport: ReactiveTimeReport
  readonly startedAt: Nullable<Date>
  addEvent: (event: ReactiveCalendarEvent) => void
  removeEvent: (event: ReactiveCalendarEvent) => void
  toSerialized: () => SerializedCalendarDay
}

export interface CalendarDayInit {
  id?: ID
  date: Date
  events?: ReactiveCalendarEvent[]
}

export type DayDeserializationAssets = EventDeserializationAssets

export function fromSerializedDay(serialized: SerializedCalendarDay, assets: DayDeserializationAssets): CalendarDayInit {
  const date = parseDate(serialized.date, DATE_FORMAT)

  assets = {
    ...assets,
    date,
  }

  return {
    id: serialized.id,
    date,
    events: serialized.events.map(it => createEvent(fromSerializedEvent(it, assets))),
  }
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

  function toSerialized(): SerializedCalendarDay {
    return {
      id: config.id,
      date: formatDate(config.date, DATE_FORMAT),
      events: inherits.events.map(it => it.toSerialized()),
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
    //
    toSerialized,
  })
}