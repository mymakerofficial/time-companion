import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {Temporal} from "temporal-polyfill";
import {dateTimeZero, durationBetween, sumOfDurations} from "@/lib/neoTime";
import type {ReactiveProject} from "@/model/project/types";

export function calculateProjectDurationExact(project: ReactiveProject, events: ReadonlyArray<ReactiveCalendarEvent>, endAtFallback?: Temporal.PlainDateTime): Temporal.Duration {
  return sumOfDurations(
    events
      .filter((event) => event.project === project)
      .map((event) => durationBetween(event.startAt ?? dateTimeZero(), event.endAt ?? endAtFallback ?? event.startAt ?? dateTimeZero()))
  )
}