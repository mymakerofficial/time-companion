import {formatDate, parseDate} from "@renderer/lib/neoTime";
import {fromSerializedEvent} from "@renderer/model/calendarEvent/serializer";
import {createEvent} from "@renderer/model/calendarEvent/model";
import type {
  CalendarDayContext,
  CalendarDayInit,
  DayDeserializationAssets,
  SerializedCalendarDay
} from "@renderer/model/calendarDay/types";

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