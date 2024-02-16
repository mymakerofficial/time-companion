import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import {isNotNull, isNull, runIf} from "@/lib/utils";
import {durationBetween, durationZero, isAfter, isBefore} from "@/lib/neoTime";
import {createEventShadow} from "@/model/eventShadow";
import type {CalendarEventContext, CalendarEventInit, ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {serializeEvent} from "@/model/calendarEvent/serializer";
import {mapReadonly, mapWritable} from "@/model/modelHelpers";

export function createEvent(init: CalendarEventInit): ReactiveCalendarEvent {
  const ctx = reactive<CalendarEventContext>({
    id: init.id ?? uuid(),
    note: init.note ?? '',
    startedAt: init.startedAt ?? null,
    endedAt: init.endedAt ?? null,
    project: init.project ?? null,
    activity: init.activity ?? null,
  })

  const startedAt = computed<CalendarEventContext['startedAt']>({
    get() { return ctx.startedAt },
    set(value) {
      if (isNull(value)) {
        ctx.startedAt = null
        ctx.endedAt = null
        return
      }

      if (isNotNull(endedAt.value) && isAfter(value, endedAt.value)) {
        throw Error('Tried to set startedAt to a value after endedAt.')
      }

      ctx.startedAt = value
    }
  })

  const endedAt = computed<CalendarEventContext['endedAt']>({
    get() { return ctx.endedAt },
    set(value) {
      if (isNull(value)) {
        ctx.endedAt = null
        return
      }

      if (isNull(startedAt.value)) {
        throw Error('Tried to set endedAt without startedAt.')
      }

      if (isBefore(value, startedAt.value)) {
        throw Error('Tried to set endedAt to a value before startedAt.')
      }

      ctx.endedAt = value
    }
  })

  const duration = computed<ReactiveCalendarEvent['duration']>({
    get() {
      if (isNull(startedAt.value) || isNull(endedAt.value)) {
        return durationZero()
      }

      return durationBetween(startedAt.value, endedAt.value)
    },
    set(value) {
      // TODO
    }
  })

  const hasStarted = computed(() => isNotNull(ctx.startedAt))
  const hasEnded = computed(() => isNotNull(ctx.endedAt))

  function createShadow() {
    if (isNull(ctx.project)) {
      throw Error('Tried to create a shadow of an event without a project.')
    }

    return createEventShadow({
      project: ctx.project,
      activity: ctx.activity,
    })
  }

  function toSerialized() {
    return serializeEvent(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, ['id']),
    ...mapWritable(ctx, [
      'note',
      'project',
      'activity'
    ]),
    projectDisplayName: computed({
      get: () => ctx.project?.displayName ?? '',
      set: (value) => runIf(ctx.project, isNotNull, () => ctx.project!.displayName = value)
    }),
    activityDisplayName: computed({
      get: () => ctx.activity?.displayName ?? '',
      set: (value) => runIf(ctx.project, isNotNull, () => ctx.activity!.displayName = value)
    }),
    color: computed({
      get: () => ctx.activity?.color ?? ctx.project?.color ?? null,
      set: (value) => {
        if (ctx.activity?.color) {
          ctx.activity.color = value
          return
        }

        if (ctx.project) {
          ctx.project.color = value
        }
      }
    }),
    startedAt,
    endedAt,
    duration,
    hasStarted,
    hasEnded,
    createShadow,
    toSerialized,
  })
}