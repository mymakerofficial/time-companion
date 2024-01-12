import type {HasId, ID} from "@/lib/types";
import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import type {Nullable} from "@/lib/utils";
import {isNotDefined} from "@/lib/utils";
import {formatDate, parseDate} from "@/lib/time-utils";

const DATE_FORMAT = 'Thh:mm:ss'

export interface SerializedCalendarReminder {
  id: string
  displayText: string
  color: Nullable<string>
  remindAt: string // Thh:mm:ss
  remindMinutesBefore: number
  remindMinutesAfter: number
  // TODO: serialize action
}

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
  toSerialized: () => SerializedCalendarReminder
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

export function fromSerializedReminder(serialized: SerializedCalendarReminder): CalendarReminderInit {
  return {
    id: serialized.id,
    displayText: serialized.displayText,
    color: serialized.color,
    remindAt: parseDate(serialized.remindAt, DATE_FORMAT),
    remindMinutesBefore: serialized.remindMinutesBefore,
    remindMinutesAfter: serialized.remindMinutesAfter,
  }
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

  function toSerialized(): SerializedCalendarReminder {
    return {
      id: config.id,
      displayText: config.displayText,
      color: config.color,
      remindAt: formatDate(config.remindAt, DATE_FORMAT),
      remindMinutesBefore: config.remindMinutesBefore,
      remindMinutesAfter: config.remindMinutesAfter,
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
    toSerialized,
  })
}