import {formatDate, parseDate} from "@/lib/neoTime";
import {fromSerializedEvent} from "@/model/calendarEvent/serializer";
import {createEvent} from "@/model/calendarEvent/model";
import type {
  CalendarDayContext,
  CalendarDayInit,
  DayDeserializationAssets,
  SerializedCalendarDay
} from "@/model/calendarDay/types";

export function fromSerializedDay(serialized: SerializedCalendarDay, assets: DayDeserializationAssets): CalendarDayInit {
  return {
    id: serialized.id,
    date: parseDate(serialized.date),
    events: serialized.events.map(it => createEvent(fromSerializedEvent(it, assets))),
  }
}

export function serializeDay(day: CalendarDayContext): SerializedCalendarDay {
  return {
    id: day.id,
    date: formatDate(day.date),
    events: day.events.map(it => it.toSerialized()),
  }
}