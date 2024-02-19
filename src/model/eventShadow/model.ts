import {computed, reactive} from "vue";
import type {CalendarEventInit} from "@/model/calendarEvent/types";
import {createEvent} from "@/model/calendarEvent/model";
import type {CalendarEventShadowInit, EventShadowContext, ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import {mapWritable} from "@/model/modelHelpers";

export function createEventShadow(init: CalendarEventShadowInit): ReactiveCalendarEventShadow {
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
    return [ctx.project.id, ctx.activity?.id].join('/')
  })

  function create(init?: CalendarEventInit) {
    return createEvent({
      project: ctx.project,
      activity: ctx.activity,
      ...init,
    })
  }

  return reactive({
    ...mapWritable(ctx, [
      'project',
      'activity',
    ]),
    id,
    color,
    combinedName,
    createEvent: create,
  })
}