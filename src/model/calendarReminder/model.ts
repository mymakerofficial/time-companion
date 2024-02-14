import {useCalendarStore} from "@/stores/calendarStore";
import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import {isNotNull, isNull} from "@/lib/utils";
import {mapReadonly, mapWritable} from "@/model/modelHelpers";
import type {
  CalendarReminderContext,
  CalendarReminderInit,
  ReactiveCalendarReminder,
} from "@/model/calendarReminder/index";
import {ReminderActionType, serializeReminder} from "@/model/calendarReminder/index";
import {minutes, timeNow} from "@/lib/neoTime";

export function createReminder(init: CalendarReminderInit): ReactiveCalendarReminder {
  const calendarStore = useCalendarStore()

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
      calendarStore.activeDay.stopEvent()
      return
    }

    if (
      ctx.actionType === ReminderActionType.START_EVENT &&
      isNotNull(ctx.actionTargetShadow)
    ) {
      calendarStore.activeDay.startEvent(ctx.actionTargetShadow)
      return
    }

    if (
      ctx.actionType === ReminderActionType.CONTINUE_PREVIOUS_EVENT
    ) {
      const shadow = calendarStore.activeDay.selectedEvent?.createShadow()

      if (isNull(shadow)) {
        return
      }

      calendarStore.activeDay.startEvent(shadow)
      return
    }
  }

  function toSerialized() {
    return serializeReminder(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, [
      'id',
      'isDismissed'
    ]),
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