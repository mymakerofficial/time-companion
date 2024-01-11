import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import type {Nullable} from "@/lib/utils";
import {reactive} from "vue";
import type {CalendarEventInit, ReactiveCalendarEvent} from "@/model/calendar-event";
import {createEvent} from "@/model/calendar-event";

export interface ReactiveCalendarEventShadow {
  project: ReactiveProject
  activity: Nullable<ReactiveActivity>
  createEvent: (init?: CalendarEventInit) => ReactiveCalendarEvent
}

export interface CalendarEventShadowInit {
  project: ReactiveProject
  activity?: Nullable<ReactiveActivity>
}

export function createEventShadow(init: CalendarEventShadowInit): ReactiveCalendarEventShadow {
  const inherits = reactive({
    project: init.project,
    activity: init.activity ?? null,
  })

  function create(init?: CalendarEventInit) {
    return createEvent({
      project: inherits.project,
      activity: inherits.activity,
      ...init,
    })
  }

  return reactive({
    project: inherits.project,
    activity: inherits.activity,
    //
    createEvent: create,
  })
}