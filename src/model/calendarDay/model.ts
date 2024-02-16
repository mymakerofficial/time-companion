import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import {firstOf} from "@/lib/listUtils";
import {serializeDay} from "@/model/calendarDay/serializer";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {CalendarDayContext, CalendarDayInit, ReactiveCalendarDay} from "@/model/calendarDay/types";
import {mapReadonly} from "@/model/modelHelpers";
import {dateZero} from "@/lib/neoTime";

export function createDay(init: CalendarDayInit): ReactiveCalendarDay {
  const ctx = reactive<CalendarDayContext>({
    id: init.id ?? uuid(),
    date: init.date ?? dateZero(),
    events: init.events ?? [],
  })

  const startedAt = computed(() => firstOf(ctx.events)?.startedAt ?? null)

  function addEvent(event: ReactiveCalendarEvent) {
    ctx.events.push(event)
  }

  function removeEvent(event: ReactiveCalendarEvent) {
    const index = ctx.events.findIndex((it) => it.id === event.id)
    if (index >= 0) {
      ctx.events.splice(index, 1)
    }
  }

  function toSerialized() {
    return serializeDay(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, [
      'id',
      'date',
      'events'
    ]),
    startedAt,
    addEvent,
    removeEvent,
    toSerialized,
  })
}