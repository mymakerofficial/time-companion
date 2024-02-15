import type {HasId} from "@/lib/types";
import type {LocalDate, LocalDateTime} from "@js-joda/core";
import type {
  EventDeserializationAssets,
  ReactiveCalendarEvent,
  SerializedCalendarEvent
} from "@/model/calendarEvent/types";
import type {Nullable} from "@/lib/utils";
import type {serializeDay} from "@/model/calendarDay/serializer";
import {Temporal} from "temporal-polyfill";

export interface CalendarDayContext extends HasId {
  date: Temporal.PlainDate
  events: ReactiveCalendarEvent[]
}

export interface ReactiveCalendarDay extends CalendarDayContext {
  readonly startedAt: Nullable<Temporal.PlainDateTime>
  addEvent: (event: ReactiveCalendarEvent) => void
  removeEvent: (event: ReactiveCalendarEvent) => void
  toSerialized: () => ReturnType<typeof serializeDay>
}

export type CalendarDayInit = Partial<CalendarDayContext>

export interface SerializedCalendarDay {
  id: string
  date: string // ISO Date (YYYY-MM-DD)
  events: SerializedCalendarEvent[]
}

export type DayDeserializationAssets = EventDeserializationAssets