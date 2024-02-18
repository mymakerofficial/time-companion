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
    startAt: init.startAt ?? null,
    endAt: init.endAt ?? null,
    project: init.project ?? null,
    activity: init.activity ?? null,
  })

  const startAt = computed<CalendarEventContext['startAt']>({
    get() { return ctx.startAt },
    set(value) {
      if (isNull(value)) {
        ctx.startAt = null
        ctx.endAt = null
        return
      }

      if (isNotNull(endAt.value) && isAfter(value, endAt.value)) {
        throw Error('Tried to set startAt to a value after endAt.')
      }

      ctx.startAt = value
    }
  })

  const endAt = computed<CalendarEventContext['endAt']>({
    get() { return ctx.endAt },
    set(value) {
      if (isNull(value)) {
        ctx.endAt = null
        return
      }

      if (isNull(startAt.value)) {
        throw Error('Tried to set endAt without startAt.')
      }

      if (isBefore(value, startAt.value)) {
        throw Error('Tried to set endAt to a value before startAt.')
      }

      ctx.endAt = value
    }
  })

  const duration = computed<ReactiveCalendarEvent['duration']>({
    get() {
      if (isNull(startAt.value) || isNull(endAt.value)) {
        return durationZero()
      }

      return durationBetween(startAt.value, endAt.value)
    },
    set(value) {
      // TODO
    }
  })

  const hasStarted = computed(() => isNotNull(ctx.startAt))
  const hasEnded = computed(() => isNotNull(ctx.endAt))

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
    startAt,
    endAt,
    duration,
    hasStarted,
    hasEnded,
    createShadow,
    toSerialized,
  })
}