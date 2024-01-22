import type {HasId, ID} from "@/lib/types";
import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import type {Nullable} from "@/lib/utils";
import {isNotDefined, isNotNull, isNull} from "@/lib/utils";
import {formatDate, parseDate} from "@/lib/timeUtils";
import type {ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import {createEventShadow} from "@/model/calendarEventShadow";
import {useCalendarStore} from "@/stores/calendarStore";

const DATE_FORMAT = 'THH:mm:ss'

export enum ReminderActionType {
  NO_ACTION = 'NO_ACTION',
  START_EVENT = 'START_EVENT',
  CONTINUE_PREVIOUS_EVENT = 'CONTINUE_PREVIOUS_EVENT',
  STOP_CURRENT_EVENT = 'STOP_CURRENT_EVENT',
}

export interface SerializedCalendarReminder {
  id: string
  displayText: string
  color: Nullable<string>
  remindAt: string // THH:mm:ss
  remindMinutesBefore: number
  remindMinutesAfter: number
  repeat: boolean[]
  actionType: ReminderActionType
  actionTargetProjectId: Nullable<string>
  actionTargetActivityId: Nullable<string>
}

export interface ReactiveCalendarReminder extends Readonly<HasId> {
  displayText: string
  color: Nullable<string>
  remindAt: Date
  remindMinutesBefore: number
  remindMinutesAfter: number
  repeat: boolean[]
  actionType: ReminderActionType
  actionTargetShadow: Nullable<ReactiveCalendarEventShadow>
  readonly actionLabel: Nullable<string>
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
  repeat?: boolean[]
  actionType: ReminderActionType
  actionTargetShadow: Nullable<ReactiveCalendarEventShadow>
}

export interface ReminderDeserializationAssets {
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
}

export function fromSerializedReminder(serialized: SerializedCalendarReminder, assets: ReminderDeserializationAssets): CalendarReminderInit {

  function getTargetShadow() {
    if ([ReminderActionType.NO_ACTION, ReminderActionType.STOP_CURRENT_EVENT].includes(serialized.actionType as ReminderActionType)) {
      return null
    }

    if (isNull(serialized.actionTargetProjectId)) {
      return null
    }

    const project = assets.projects.find((it) => it.id === serialized.actionTargetProjectId) ?? null

    if (isNull(project)) {
      return null
    }

    const activity = assets.activities.find((it) => it.id === serialized.actionTargetActivityId) ?? null

    return createEventShadow({project, activity})
  }

  return {
    id: serialized.id,
    displayText: serialized.displayText,
    color: serialized.color,
    remindAt: parseDate(serialized.remindAt, DATE_FORMAT),
    remindMinutesBefore: serialized.remindMinutesBefore,
    remindMinutesAfter: serialized.remindMinutesAfter,
    repeat: serialized.repeat,
    actionType: serialized.actionType as ReminderActionType,
    actionTargetShadow: getTargetShadow(),
  }
}

export function createReminder(init: CalendarReminderInit): ReactiveCalendarReminder {
  const calendarStore = useCalendarStore()

  const config = reactive({
    id: init.id ?? uuid(),
    displayText: init.displayText ?? '',
    color: init.color ?? null,
    remindAt: init.remindAt ?? new Date(),
    remindMinutesBefore: init.remindMinutesBefore ?? 30,
    remindMinutesAfter: init.remindMinutesAfter ?? 30,
    repeat: init.repeat ?? [true, true, true, true, true, true, true],
    actionType: init.actionType,
    actionTargetShadow: init.actionTargetShadow,
  })

  const state = reactive({
    isDismissed: false,
  })

  const actionLabel = computed(() => {
    switch (config.actionType) {
      case ReminderActionType.NO_ACTION:
        return null
      case ReminderActionType.START_EVENT:
        return `Start ${config.actionTargetShadow?.project.displayName}`
      case ReminderActionType.CONTINUE_PREVIOUS_EVENT:
        return 'Continue'
      case ReminderActionType.STOP_CURRENT_EVENT:
        return 'Stop'
    }
  })

  function dismiss() {
    state.isDismissed = true
  }

  function triggerAction() {
    dismiss()

    if (config.actionType === ReminderActionType.NO_ACTION) {
      return
    }

    if (config.actionType === ReminderActionType.STOP_CURRENT_EVENT) {
      calendarStore.activeDay.stopEvent()
      return
    }

    if (
      config.actionType === ReminderActionType.START_EVENT &&
      isNotNull(config.actionTargetShadow)
    ) {
      calendarStore.activeDay.startEvent(config.actionTargetShadow)
      return
    }

    if (
      config.actionType === ReminderActionType.CONTINUE_PREVIOUS_EVENT
    ) {
      const shadow = calendarStore.activeDay.selectedEvent?.createShadow()

      if (isNull(shadow)) {
        return
      }

      calendarStore.activeDay.startEvent(shadow)
      return
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
      repeat: config.repeat,
      actionType: config.actionType,
      actionTargetProjectId: config.actionTargetShadow?.project.id ?? null,
      actionTargetActivityId: config.actionTargetShadow?.activity?.id ?? null,
    }
  }

  return reactive({
    id: computed(() => config.id),
    displayText: computed({
      get: () => config.displayText,
      set: (value) => config.displayText = value,
    }),
    color: computed({
      get: () => config.color ?? config.actionTargetShadow?.color ?? null,
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
    repeat: computed({
      get: () => config.repeat,
      set: (value) => config.repeat = value,
    }),
    actionType: computed({
      get: () => config.actionType,
      set: (value) => config.actionType = value,
    }),
    actionTargetShadow: config.actionTargetShadow,
    actionLabel,
    isDismissed: computed(() => state.isDismissed),
    triggerAction,
    dismiss,
    toSerialized,
  })
}