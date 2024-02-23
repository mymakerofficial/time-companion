import type {Nullable} from "@/lib/utils";
import type {HasId} from "@/lib/types";
import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveActivity} from "@/model/activity/types";
import type {ProjectsStore} from "@/stores/projectsStore";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import {Temporal} from "temporal-polyfill";
import type {ReactiveCalendarDay} from "@/model/calendarDay/types";

export interface CalendarEventContext extends HasId {
  day: Nullable<ReactiveCalendarDay>
  project: Nullable<ReactiveProject>
  activity: Nullable<ReactiveActivity>
  note: string
  startAt: Temporal.PlainDateTime
  endAt: Nullable<Temporal.PlainDateTime>
}

export interface ReactiveCalendarEvent {
  readonly id: CalendarEventContext['id']
  readonly day: CalendarEventContext['day']
  project: CalendarEventContext['project']
  activity: CalendarEventContext['activity']
  note: CalendarEventContext['note']
  startAt: CalendarEventContext['startAt']
  endAt: CalendarEventContext['endAt']
  readonly projectDisplayName: ReactiveProject['displayName']
  readonly activityDisplayName: ReactiveActivity['displayName']
  color: ReactiveProject['color']
  readonly duration: Temporal.Duration
  readonly hasStarted: boolean
  readonly hasEnded: boolean
  unsafeSetDay: (day: Nullable<ReactiveCalendarDay>) => void
  createShadow: () => ReactiveCalendarEventShadow
  toSerialized: () => SerializedCalendarEvent
}

export type CalendarEventInit = Partial<CalendarEventContext>

export interface SerializedCalendarEvent {
  id: string
  projectId: Nullable<string>
  activityId: Nullable<string>
  note: string
  startAt: string // ISO DateTime (YYYY-MM-DDTHH:mm:ss)
  endAt: Nullable<string> // ISO DateTime (YYYY-MM-DDTHH:mm:ss)
}

export type EventDeserializationAssets = Pick<ProjectsStore,
  'projects' |
  'activities'
>