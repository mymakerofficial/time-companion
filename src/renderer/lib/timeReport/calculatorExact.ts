import type { ReactiveCalendarEvent } from '@renderer/model/calendarEvent/types'
import {
  dateTimeZero,
  durationBetween,
  sumOfDurations,
} from '@renderer/lib/neoTime'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { Duration } from '@shared/lib/datetime/duration'

export function calculateProjectDurationExact(
  project: ReactiveProject,
  events: ReadonlyArray<ReactiveCalendarEvent>,
  endAtFallback?: PlainDateTime,
): Duration {
  return sumOfDurations(
    events
      .filter((event) => event.project === project)
      .map((event) =>
        durationBetween(
          event.startAt ?? dateTimeZero(),
          event.endAt ?? endAtFallback ?? event.startAt ?? dateTimeZero(),
        ),
      ),
  )
}
