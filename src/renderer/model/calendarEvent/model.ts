import { computed, reactive } from 'vue'
import { v4 as uuid } from 'uuid'
import {
  check,
  isNotNull,
  isNull,
  type Nullable,
  runIf,
} from '@renderer/lib/utils'
import {
  dateTimeIsAfter,
  dateTimeIsBefore,
  dateTimeZero,
  durationBetween,
  durationZero,
} from '@renderer/lib/neoTime'
import { createEventShadow } from '@renderer/model/eventShadow/model'
import type {
  CalendarEventContext,
  CalendarEventInit,
  ReactiveCalendarEvent,
} from '@renderer/model/calendarEvent/types'
import { serializeEvent } from '@renderer/model/calendarEvent/serializer'
import { mapReadonly, mapWritable } from '@renderer/model/modelHelpers'
import type { ReactiveCalendarDay } from '@renderer/model/calendarDay/types'

export function createEvent(init: CalendarEventInit): ReactiveCalendarEvent {
  const ctx = reactive<CalendarEventContext>({
    id: init.id ?? uuid(),
    day: init.day ?? null,
    project: init.project ?? null,
    activity: init.activity ?? null,
    note: init.note ?? '',
    startAt: init.startAt ?? dateTimeZero(),
    endAt: init.endAt ?? null,
  })

  const startAt = computed<CalendarEventContext['startAt']>({
    get() {
      return ctx.startAt
    },
    set(value) {
      check(
        isNull(endAt.value) || dateTimeIsBefore(value, endAt.value),
        'Tried to set startAt to a value after endAt.',
      )

      ctx.startAt = value
    },
  })

  const endAt = computed<CalendarEventContext['endAt']>({
    get() {
      return ctx.endAt
    },
    set(value) {
      check(
        isNull(value) || dateTimeIsAfter(value, startAt.value),
        'Tried to set endAt to a value before startAt.',
      )

      ctx.endAt = value
    },
  })

  const duration = computed<ReactiveCalendarEvent['duration']>({
    get() {
      if (isNull(endAt.value)) {
        return durationZero()
      }

      return durationBetween(startAt.value, endAt.value)
    },
    set(value) {
      check(value.sign >= 0, 'Tried to set duration to a negative value.')

      endAt.value = startAt.value.add(value)
    },
  })

  const hasStarted = computed(() => isNotNull(ctx.startAt))
  const hasEnded = computed(() => isNotNull(ctx.endAt))

  function unsafeSetDay(day: Nullable<ReactiveCalendarDay>) {
    ctx.day = day
  }

  function createShadow() {
    if (isNull(ctx.project)) {
      return null
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
    ...mapReadonly(ctx, ['id', 'day']),
    ...mapWritable(ctx, ['note', 'project', 'activity']),
    projectDisplayName: computed({
      get: () => ctx.project?.displayName ?? '',
      set: (value) =>
        runIf(ctx.project, isNotNull, () => (ctx.project!.displayName = value)),
    }),
    activityDisplayName: computed({
      get: () => ctx.activity?.displayName ?? '',
      set: (value) =>
        runIf(
          ctx.project,
          isNotNull,
          () => (ctx.activity!.displayName = value),
        ),
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
      },
    }),
    startAt,
    endAt,
    duration,
    hasStarted,
    hasEnded,
    unsafeSetDay,
    createShadow,
    toSerialized,
  })
}
