import {v4 as uuid} from "uuid";
import {computed, reactive, ref} from "vue";
import type {Nullable} from "@/lib/utils";
import type {ReactiveActivity} from "@/model/activity";
import {isNotNull, runIf} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";

export interface ReactiveCalendarEvent extends HasId {
  projectId: Nullable<ReactiveActivity['projectId']>
  projectDisplayName: ReactiveActivity['projectDisplayName']
  activity: Nullable<ReactiveActivity>
  activityId: Nullable<ReactiveActivity['id']>
  activityDisplayName: ReactiveActivity['displayName']
  privateNote: Nullable<string>
  color: ReactiveActivity['color']
  startedAt: Nullable<Date>
  endedAt: Nullable<Date>
  hasStarted: boolean
  hasEnded: boolean
}

export interface CalendarEventInit {
  id?: ID
  activity?: Nullable<ReactiveActivity>
  privateNote?: Nullable<string>
  startedAt?: Nullable<Date>
  endedAt?: Nullable<Date>
}

export function createEvent(init: CalendarEventInit): ReactiveCalendarEvent {
  const config = reactive({
    id: init.id ?? uuid(),
    privateNote: init.privateNote ?? null,
    startedAt: init.startedAt ?? null,
    endedAt: init.endedAt ?? null,
  })

  const inherits = reactive({
    activity: init.activity ?? null,
  })

  const hasStarted = computed(() => isNotNull(config.startedAt))
  const hasEnded = computed(() => isNotNull(config.endedAt))

  return reactive({
    id: computed(() => config.id),
    projectId: computed(() => inherits.activity?.projectId ?? null),
    projectDisplayName: computed({
      get: () => inherits.activity?.projectDisplayName ?? '',
      set: (value) => runIf(inherits.activity, isNotNull, () => inherits.activity!.projectDisplayName = value)
    }),
    activity: computed(() => inherits.activity),
    activityId: computed(() => inherits.activity?.id ?? null),
    activityDisplayName: computed({
      get: () => inherits.activity?.displayName ?? '',
      set: (value) => runIf(inherits.activity, isNotNull, () => inherits.activity!.displayName = value)
    }),
    color: computed({
      get: () => inherits.activity?.color ?? null,
      set: (value) => runIf(inherits.activity, isNotNull, () => inherits.activity!.color = value)
    }),
    privateNote: config.privateNote,
    startedAt: config.startedAt,
    endedAt: config.endedAt,
    hasStarted,
    hasEnded,
  })
}