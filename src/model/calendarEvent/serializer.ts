import {formatDateTime, parseDateTime} from "@/lib/neoTime";
import type {
  CalendarEventContext,
  CalendarEventInit,
  EventDeserializationAssets,
  SerializedCalendarEvent
} from "@/model/calendarEvent/types";
import {isNotNull} from "@/lib/utils";
import {whereId} from "@/lib/listUtils";

export function fromSerializedEvent(serialized: SerializedCalendarEvent, assets: EventDeserializationAssets): CalendarEventInit {
  return {
    id: serialized.id,
    note: serialized.note,
    startAt: isNotNull(serialized.startAt) ? parseDateTime(serialized.startAt) : null, // TODO handle null
    endAt: isNotNull(serialized.endAt) ? parseDateTime(serialized.endAt) : null,
    project: assets.projects.find(whereId(serialized.projectId)) ?? null,
    activity: assets.activities.find(whereId(serialized.activityId)) ?? null,
  }
}

export function serializeEvent(event: CalendarEventContext): SerializedCalendarEvent {
  return {
    id: event.id,
    projectId: event.project?.id ?? null,
    activityId: event.activity?.id ?? null,
    note: event.note,
    startAt: isNotNull(event.startAt) ? formatDateTime(event.startAt) : null, // TODO handle null
    endAt: isNotNull(event.endAt) ? formatDateTime(event.endAt) : null,
  }
}