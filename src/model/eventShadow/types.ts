import type {ReactiveProject} from "@/model/project";
import type {Nullable} from "@/lib/utils";
import type {ReactiveActivity} from "@/model/activity";
import type {CalendarEventInit, ReactiveCalendarEvent} from "@/model/calendarEvent";
import type {ID} from "@/lib/types";

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