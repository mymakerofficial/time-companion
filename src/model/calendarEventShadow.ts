import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import type {Nullable} from "@/lib/utils";
import {isDefined} from "@/lib/utils";
import {computed, reactive} from "vue";
import type {CalendarEventInit, ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {createEvent} from "@/model/calendarEvent/model";

export interface ReactiveCalendarEventShadow {
  project: ReactiveProject
  activity: Nullable<ReactiveActivity>
  readonly color: ReactiveProject['color']
  readonly combinedName: string
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
    color: computed(() => inherits.activity?.color ?? inherits.project.color),
    combinedName: computed(() => `${inherits?.project.displayName}${isDefined(inherits?.activity) ? '/' : ''}${inherits?.activity?.displayName ?? ''}`),
    createEvent: create,
  })
}