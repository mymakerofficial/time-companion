import type { HasId } from '@renderer/lib/types'
import type {
  EventDeserializationAssets,
  ReactiveCalendarEvent,
  SerializedCalendarEvent,
} from '@renderer/model/calendarEvent/types'
import type { Nullable } from '@renderer/lib/utils'
import type { PlainDate } from '@shared/lib/datetime/plainDate'

export interface CalendarDayContext extends HasId {
  date: PlainDate
  events: ReactiveCalendarEvent[]
}

export interface ReactiveCalendarDay {
  id: Readonly<CalendarDayContext['id']>
  date: CalendarDayContext['date']
  events: ReadonlyArray<ReactiveCalendarEvent>
  startAt: Readonly<Nullable<ReactiveCalendarEvent['startAt']>>
  unsafeAddEvent: (event: ReactiveCalendarEvent) => void
  unsafeRemoveEvent: (event: ReactiveCalendarEvent) => void
  toSerialized: () => SerializedCalendarDay
}

export type CalendarDayInit = Partial<CalendarDayContext>

export interface SerializedCalendarDay {
  id: string
  date: string // ISO Date (YYYY-MM-DD)
  events: SerializedCalendarEvent[]
}

export type DayDeserializationAssets = EventDeserializationAssets
