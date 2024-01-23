import type {HasId, ID} from "@/lib/types";
import {computed, reactive} from "vue";
import {v4 as uuid} from "uuid";
import type {Nullable} from "@/lib/utils";
import {isNotNull, isNull} from "@/lib/utils";
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

export interface RepeatOnWeekdays {
  monday: boolean,
  tuesday: boolean,
  wednesday: boolean,
  thursday: boolean,
  friday: boolean,
  saturday: boolean,
  sunday: boolean,
}

export interface SerializedCalendarReminder {
  id: string
  displayText: string
  color: Nullable<string>
  remindAt: string // THH:mm:ss
  remindMinutesBefore: number
  remindMinutesAfter: number
  repeatOn: boolean[] // [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
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
  repeatOn: RepeatOnWeekdays
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
  repeatOn?: RepeatOnWeekdays
  actionType: ReminderActionType
  actionTargetShadow: Nullable<ReactiveCalendarEventShadow>
}

export interface ReminderDeserializationAssets {
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
}

export function createRepeatOnWeekdays(list: boolean[]): RepeatOnWeekdays {
  return {
    monday: list[0] ?? true,
    tuesday: list[1] ?? true,
    wednesday: list[2] ?? true,
    thursday: list[3] ?? true,
    friday: list[4] ?? true,
    saturday: list[5] ?? true,
    sunday: list[6] ?? true,
  }
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
    repeatOn: createRepeatOnWeekdays(serialized.repeatOn),
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
    repeatOn: init.repeatOn ?? createRepeatOnWeekdays([true, true, true, true, true, true, true]),
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
        return `Start ${config.actionTargetShadow?.project.displayName} now`
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
      repeatOn: [
        config.repeatOn.monday,
        config.repeatOn.tuesday,
        config.repeatOn.wednesday,
        config.repeatOn.thursday,
        config.repeatOn.friday,
        config.repeatOn.saturday,
        config.repeatOn.sunday,
      ],
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
    repeatOn: computed({
      get: () => config.repeatOn,
      set: (value) => config.repeatOn = value,
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