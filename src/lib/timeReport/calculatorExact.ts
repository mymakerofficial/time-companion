import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {Temporal} from "temporal-polyfill";
import {dateTimeZero, durationBetween, now, sumOfDurations} from "@/lib/neoTime";
import type {ReactiveProject} from "@/model/project/types";

export function calculateProjectDurationExact(project: ReactiveProject, events: ReadonlyArray<ReactiveCalendarEvent>): Temporal.Duration {
  return sumOfDurations(
    events
      .filter((event) => event.project === project)
      .map((event) => durationBetween(event.startAt ?? dateTimeZero(), event.endAt ?? now()))
  )
}