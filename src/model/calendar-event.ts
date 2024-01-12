import {v4 as uuid} from "uuid";
import {computed, reactive, ref} from "vue";
import type {Nullable} from "@/lib/utils";
import type {ReactiveActivity} from "@/model/activity";
import {isNotNull, isNull, runIf} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";
import {minutesSinceStartOfDay, parseDate} from "@/lib/time-utils";
import dayjs from "dayjs";
import type {ReactiveProject} from "@/model/project";
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/calendar-event-shadow";

export interface SerializedCalendarEvent {
  id: string
  note: string
  startedAt: Nullable<string> // ISO 8601
  endedAt: Nullable<string> // ISO 8601
  projectId: Nullable<string>
  activityId: Nullable<string>
}

export interface ReactiveCalendarEvent extends Readonly<HasId> {
  project: Nullable<ReactiveProject>
  activity: Nullable<ReactiveActivity>
  note: string
  projectDisplayName: ReactiveProject['displayName']
  activityDisplayName: ReactiveActivity['displayName']
  color: ReactiveProject['color']
  startedAt: Nullable<Date>
  endedAt: Nullable<Date>
  durationMinutes: number
  readonly hasStarted: boolean
  readonly hasEnded: boolean
  createShadow: () => ReactiveCalendarEventShadow
  toSerialized: () => SerializedCalendarEvent
}

export interface CalendarEventInit {
  id?: ID
  project?: Nullable<ReactiveProject>
  activity?: Nullable<ReactiveActivity>
  note?: string
  startedAt?: Nullable<Date>
  endedAt?: Nullable<Date>
}

export interface EventDeserializationAssets {
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
}

export function fromSerializedEvent(serialized: SerializedCalendarEvent, assets: EventDeserializationAssets): CalendarEventInit {
  return {
    id: serialized.id,
    note: serialized.note,
    startedAt: serialized.startedAt ? parseDate(serialized.startedAt) : null,
    endedAt: serialized.endedAt ? parseDate(serialized.endedAt) : null,
    project: assets.projects.find((it) => it.id === serialized.projectId) ?? null,
    activity: assets.activities.find((it) => it.id === serialized.activityId) ?? null,
  }
}

export function createEvent(init: CalendarEventInit): ReactiveCalendarEvent {
  const config = reactive({
    id: init.id ?? uuid(),
    note: init.note ?? '',
    startedAt: init.startedAt ?? null,
    endedAt: init.endedAt ?? null,
  })

  const inherits = reactive({
    project: init.project ?? null,
    activity: init.activity ?? null,
  })

  const hasStarted = computed(() => isNotNull(config.startedAt))
  const hasEnded = computed(() => isNotNull(config.endedAt))

  const startedAt = computed({
    get() { return config.startedAt },
    set(value) {
      if (isNull(value)) {
        config.startedAt = null
        config.endedAt = null
        return
      }

      if (dayjs(value).isAfter(dayjs(endedAt.value))) {
        throw Error('Tried to set startedAt after endedAt.')
      }

      config.startedAt = value
    }
  })

  const endedAt = computed({
    get() { return config.endedAt },
    set(value) {
      if (isNull(value)) {
        config.endedAt = null
        return
      }

      if (dayjs(value).isBefore(dayjs(startedAt.value))) {
        throw Error('Tried to set endedAt before startedAt.')
      }

      config.endedAt = value
    }
  })

  const durationMinutes = computed({
    get() {
      if (!hasStarted.value || !hasEnded.value) {
        return 0
      }

      return minutesSinceStartOfDay(config.endedAt) - minutesSinceStartOfDay(config.startedAt)
    },
    set(value) {
      if (isNull(config.startedAt)) {
        throw Error('Tried to set durationMinutes before startedAt was set.')
      }

      if (value < 0) {
        throw Error('Tried to set durationMinutes to a negative value.')
      }

      config.endedAt = dayjs(config.startedAt).add(value, 'minute').toDate()
    }
  })

  function createShadow() {
    if (isNull(inherits.project)) {
      throw Error('Tried to create a shadow of an event without a project.')
    }

    return createEventShadow({
      project: inherits.project,
      activity: inherits.activity,
    })
  }

  function toSerialized(): SerializedCalendarEvent {
    return {
      id: config.id,
      note: config.note,
      startedAt: config.startedAt?.toISOString() ?? null,
      endedAt: config.endedAt?.toISOString() ?? null,
      projectId: inherits.project?.id ?? null,
      activityId: inherits.activity?.id ?? null,
    }
  }

  return reactive({
    id: computed(() => config.id),
    //
    project: computed({
      get: () => inherits.project,
      set: (value) => inherits.project = value
    }),
    activity: computed({
      get: () => inherits.activity,
      set: (value) => inherits.activity = value
    }),
    note: computed({
      get: () => config.note,
      set: (value) => config.note = value
    }),
    //
    projectDisplayName: computed({
      get: () => inherits.project?.displayName ?? '',
      set: (value) => runIf(inherits.project, isNotNull, () => inherits.project!.displayName = value)
    }),
    activityDisplayName: computed({
      get: () => inherits.activity?.displayName ?? '',
      set: (value) => runIf(inherits.project, isNotNull, () => inherits.activity!.displayName = value)
    }),
    color: computed({
      get: () => inherits.project?.color ?? null,
      set: (value) => runIf(inherits.project, isNotNull, () => inherits.project!.color = value)
    }),
    //
    startedAt,
    endedAt,
    durationMinutes,
    hasStarted,
    hasEnded,
    //
    createShadow,
    toSerialized,
  })
}