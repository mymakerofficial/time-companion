import { computed, reactive } from 'vue'
import { v4 as uuid } from 'uuid'
import { isNotNull } from '@renderer/lib/utils'
import { mapReadonly, mapWritable } from '@renderer/model/modelHelpers'
import type {
  CalendarReminderContext,
  CalendarReminderInit,
  ReactiveCalendarReminder,
} from '@renderer/model/calendarReminder/types'
import { ReminderActionType } from '@renderer/model/calendarReminder/types'
import { serializeReminder } from '@renderer/model/calendarReminder/serializer'
import { minutes, timeNow } from '@renderer/lib/neoTime'
import { useActiveEventService } from '@renderer/services/activeEventService'

export function createReminder(
  init: CalendarReminderInit,
): ReactiveCalendarReminder {
  const activeEventService = useActiveEventService()

  const ctx = reactive<CalendarReminderContext>({
    id: init.id ?? uuid(),
    displayText: init.displayText ?? '',
    color: init.color ?? null,
    startAt: init.startAt ?? timeNow(),
    remindBefore: init.remindBefore ?? minutes(30),
    remindAfter: init.remindAfter ?? minutes(30),
    actionType: init.actionType ?? ReminderActionType.NO_ACTION,
    actionTargetShadow: init.actionTargetShadow ?? null,
    isDismissed: false,
  })

  const color = computed({
    get() {
      return ctx.color ?? ctx.actionTargetShadow?.color ?? null
    },
    set(value) {
      ctx.color = value
    },
  })

  // TODO i18n
  const actionLabel = computed(() => {
    switch (ctx.actionType) {
      case ReminderActionType.NO_ACTION:
        return null
      case ReminderActionType.START_EVENT:
        return `Start ${ctx.actionTargetShadow?.project.displayName} now`
      case ReminderActionType.CONTINUE_PREVIOUS_EVENT:
        return 'Continue'
      case ReminderActionType.STOP_CURRENT_EVENT:
        return 'Stop'
    }
  })

  function dismiss() {
    ctx.isDismissed = true
  }

  // TODO move to somewhere more appropriate
  function triggerAction() {
    dismiss()

    if (ctx.actionType === ReminderActionType.NO_ACTION) {
      return
    }

    if (ctx.actionType === ReminderActionType.STOP_CURRENT_EVENT) {
      activeEventService.stopEvent()
      return
    }

    if (
      ctx.actionType === ReminderActionType.START_EVENT &&
      isNotNull(ctx.actionTargetShadow)
    ) {
      activeEventService.startEvent(ctx.actionTargetShadow)
      return
    }

    if (ctx.actionType === ReminderActionType.CONTINUE_PREVIOUS_EVENT) {
      // TODO implement CONTINUE_PREVIOUS_EVENT
      return
    }
  }

  function toSerialized() {
    return serializeReminder(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, ['id', 'isDismissed']),
    ...mapWritable(ctx, [
      'displayText',
      'startAt',
      'remindBefore',
      'remindAfter',
      'actionType',
      'actionTargetShadow',
    ]),
    color,
    actionLabel,
    triggerAction,
    dismiss,
    toSerialized,
  })
}
