import type {HasId, ID} from "@/lib/types";
import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import type {Nullable} from "@/lib/utils";
import {isNotDefined} from "@/lib/utils";

export interface ReactiveCalendarReminder extends Readonly<HasId> {
  displayText: string
  color: Nullable<string>
  remindAt: Date
  remindMinutesBefore: number
  remindMinutesAfter: number
  actionLabel: Nullable<string>
  onAction: Nullable<() => void>
  dismissAfterAction: boolean
  readonly isDismissed: boolean
  triggerAction: () => void
  dismiss: () => void
}

export interface CalendarReminderInit {
  id?: ID
  displayText?: string
  color?: Nullable<string>
  remindAt?: Date
  remindMinutesBefore?: number
  remindMinutesAfter?: number
  actionLabel?: Nullable<string>
  onAction?: Nullable<() => void>
  dismissAfterAction?: boolean
}

export function createReminder(init: CalendarReminderInit): ReactiveCalendarReminder {
  const config = reactive({
    id: init.id ?? uuid(),
    displayText: init.displayText ?? '',
    color: init.color ?? null,
    remindAt: init.remindAt ?? new Date(),
    remindMinutesBefore: init.remindMinutesBefore ?? 30,
    remindMinutesAfter: init.remindMinutesAfter ?? 30,
    actionLabel: init.actionLabel ?? null,
    onAction: init.onAction ?? null,
    dismissAfterAction: init.dismissAfterAction ?? true,
  })

  const state = reactive({
    isDismissed: false,
  })

  function dismiss() {
    state.isDismissed = true
  }

  function triggerAction() {
    if (isNotDefined(config.onAction)) {
      return
    }

    config.onAction()

    if (config.dismissAfterAction) {
      dismiss()
    }
  }

  return reactive({
    id: computed(() => config.id),
    displayText: computed({
      get: () => config.displayText,
      set: (value) => config.displayText = value,
    }),
    color: computed({
      get: () => config.color,
      set: (value) => config.color = value,
    }),
    remindAt: computed({
      get: () => config.remindAt,
      set: (value) => config.remindAt = value,
    }),
    remindMinutesBefore: computed({
      get: () => config.remindMinutesBefore,
      set: (value) => config.remindMinutesBefore = value,
    }),
    remindMinutesAfter: computed({
      get: () => config.remindMinutesAfter,
      set: (value) => config.remindMinutesAfter = value,
    }),
    actionLabel: computed({
      get: () => config.actionLabel,
      set: (value) => config.actionLabel = value,
    }),
    onAction: computed({
      get: () => config.onAction,
      set: (value) => config.onAction = value,
    }),
    dismissAfterAction: computed({
      get: () => config.dismissAfterAction,
      set: (value) => config.dismissAfterAction = value,
    }),
    isDismissed: computed(() => state.isDismissed),
    triggerAction,
    dismiss,
  })
}