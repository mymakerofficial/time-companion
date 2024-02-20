import type {SerializedCalendarDay} from "@/model/calendarDay/types";
import {defineMigrator} from "@/lib/migrations";

function upgradeVersion0(original: any): any {
  return {
    id: original.id,
    date: original.date,
    events: original.events.map((event: any) => ({
      id: event.id,
      startAt: `${original.date}${event.startedAt}`,
      endAt: `${original.date}${event.endedAt}`,
      projectId: event.projectId,
      activityId: event.activityId,
    }))
  }
}

export const migrateCalendarDay = defineMigrator<SerializedCalendarDay>([
  upgradeVersion0,
])