import type {ReactiveProject} from "@renderer/model/project/types";
import type {Nullable} from "@renderer/lib/utils";
import type {ReactiveActivity} from "@renderer/model/activity/types";
import type {CalendarEventInit, ReactiveCalendarEvent} from "@renderer/model/calendarEvent/types";
import type {ID} from "@renderer/lib/types";

export interface EventShadowContext {
  project: ReactiveProject
  activity: Nullable<ReactiveActivity>
}

export interface ReactiveCalendarEventShadow extends EventShadowContext {
  id: Readonly<ID>
  color: Readonly<ReactiveProject['color']>
  combinedName: Readonly<string>
  createEvent: (init?: CalendarEventInit) => ReactiveCalendarEvent
}

export interface CalendarEventShadowInit {
  project: ReactiveProject
  activity?: Nullable<ReactiveActivity>
}