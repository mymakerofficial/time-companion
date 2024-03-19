import { computed, reactive } from 'vue'
import { v4 as uuid } from 'uuid'
import { firstOf } from '@renderer/lib/listUtils'
import { serializeDay } from '@renderer/model/calendarDay/serializer'
import type { ReactiveCalendarEvent } from '@renderer/model/calendarEvent/types'
import type {
  CalendarDayContext,
  CalendarDayInit,
  ReactiveCalendarDay,
} from '@renderer/model/calendarDay/types'
import { mapReadonly } from '@renderer/model/modelHelpers'
import { dateZero } from '@renderer/lib/neoTime'
import { check } from '@renderer/lib/utils'

export function createDay(init: CalendarDayInit): ReactiveCalendarDay {
  const ctx = reactive<CalendarDayContext>({
    id: init.id ?? uuid(),
    date: init.date ?? dateZero(),
    events: init.events ?? [],
  })

  const startAt = computed(() => firstOf(ctx.events)?.startAt ?? null)

  function unsafeAddEvent(event: ReactiveCalendarEvent) {
    ctx.events.push(event)
  }

  function unsafeRemoveEvent(event: ReactiveCalendarEvent) {
    const index = ctx.events.indexOf(event)

    check(
      index !== -1,
      `Failed to remove event "${event.id}": Event does not exist in day "${ctx.id}".`,
    )

    ctx.events.splice(index, 1)
  }

  function toSerialized() {
    return serializeDay(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, ['id', 'date', 'events']),
    startAt,
    unsafeAddEvent,
    unsafeRemoveEvent,
    toSerialized,
  })
}
