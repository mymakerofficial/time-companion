import { computed, reactive } from 'vue'
import type { CalendarEventInit } from '@renderer/model/calendarEvent/types'
import { createEvent } from '@renderer/model/calendarEvent/model'
import type {
  CalendarEventShadowInit,
  EventShadowContext,
  ReactiveCalendarEventShadow,
} from '@renderer/model/eventShadow/types'
import { mapWritable } from '@renderer/model/modelHelpers'

export function createEventShadow(
  init: CalendarEventShadowInit,
): ReactiveCalendarEventShadow {
  const ctx = reactive<EventShadowContext>({
    project: init.project,
    activity: init.activity ?? null,
  })

  const id = computed(() => {
    return [ctx.project.id, ctx.activity?.id].join('-')
  })

  const color = computed(() => {
    return ctx.activity?.color ?? ctx.project.color
  })

  const combinedName = computed(() => {
    return [ctx.project.displayName, ctx.activity?.displayName].join('/')
  })

  function create(init?: CalendarEventInit) {
    return createEvent({
      project: ctx.project,
      activity: ctx.activity,
      ...init,
    })
  }

  return reactive({
    ...mapWritable(ctx, ['project', 'activity']),
    id,
    color,
    combinedName,
    createEvent: create,
  })
}
