import type {Nullable} from "@/lib/utils";
import type {HasId} from "@/lib/types";
import type {ReactiveProject} from "@/model/project/";
import type {ReactiveActivity} from "@/model/activity/";
import type {Duration, LocalDateTime} from "@js-joda/core";
import type {ProjectsStore} from "@/stores/projectsStore";
import type {createEventShadow} from "@/model/eventShadow";
import type {serializeEvent} from "@/model/calendarEvent/serializer";
import {Temporal} from "temporal-polyfill";

export interface CalendarEventContext extends HasId {
  project: Nullable<ReactiveProject>
  activity: Nullable<ReactiveActivity>
  note: string
  startAt: Temporal.PlainDateTime
  endAt: Nullable<Temporal.PlainDateTime>
}

export interface ReactiveCalendarEvent extends CalendarEventContext {
  projectDisplayName: ReactiveProject['displayName']
  activityDisplayName: ReactiveActivity['displayName']
  color: ReactiveProject['color']
  readonly duration: Temporal.Duration
  readonly hasStarted: boolean
  readonly hasEnded: boolean
  createShadow: () => ReturnType<typeof createEventShadow>
  toSerialized: () => ReturnType<typeof serializeEvent>
}

export type CalendarEventInit = Partial<CalendarEventContext>

export interface SerializedCalendarEvent {
  id: string
  projectId: Nullable<string>
  activityId: Nullable<string>
  note: string
  startAt: Nullable<string> // ISO DateTime (YYYY-MM-DDTHH:mm:ss)
  endAt: Nullable<string> // ISO DateTime (YYYY-MM-DDTHH:mm:ss)
}

export type EventDeserializationAssets = Pick<ProjectsStore,
  'projects' |
  'activities'
>