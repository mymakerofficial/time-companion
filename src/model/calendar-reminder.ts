import type {HasId, ID} from "@/lib/types";
import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import type {Nullable} from "@/lib/utils";

export interface ReactiveCalendarReminder extends HasId {
  displayText: string
  color: Nullable<string>
  remindAt: Date
  remindMinutesBefore: number
  remindMinutesAfter: number
  actionLabel: Nullable<string>
  onAction: Nullable<() => void>
  dismissAfterAction: boolean
  isDismissed: boolean
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

  return reactive({
    id: computed(() => config.id),
    displayText: config.displayText,
    color: config.color,
    remindAt: config.remindAt,
    remindMinutesBefore: config.remindMinutesBefore,
    remindMinutesAfter: config.remindMinutesAfter,
    actionLabel: config.actionLabel,
    onAction: config.onAction,
    dismissAfterAction: config.dismissAfterAction,
    isDismissed: state.isDismissed,
  })
}