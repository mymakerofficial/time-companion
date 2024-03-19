import type { HasId } from '@renderer/lib/types'
import type { Nullable } from '@renderer/lib/utils'
import type { ReactiveCalendarEventShadow } from '@renderer/model/eventShadow/types'
import { Temporal } from 'temporal-polyfill'
import type { ProjectsService } from '@renderer/services/projectsService'

export enum ReminderActionType {
  NO_ACTION = 'NO_ACTION',
  START_EVENT = 'START_EVENT',
  CONTINUE_PREVIOUS_EVENT = 'CONTINUE_PREVIOUS_EVENT',
  STOP_CURRENT_EVENT = 'STOP_CURRENT_EVENT',
}

export interface CalendarReminderContext extends HasId {
  displayText: string
  color: Nullable<string>
  startAt: Temporal.PlainTime
  remindBefore: Temporal.Duration
  remindAfter: Temporal.Duration
  actionType: ReminderActionType
  actionTargetShadow: Nullable<ReactiveCalendarEventShadow>
  isDismissed: boolean
}

export interface ReactiveCalendarReminder extends CalendarReminderContext {
  readonly actionLabel: Nullable<string>
  triggerAction: () => void
  dismiss: () => void
  toSerialized: () => SerializedCalendarReminder
}

export type CalendarReminderInit = Partial<
  Omit<CalendarReminderContext, 'isDismissed'>
>

export interface SerializedCalendarReminder {
  id: string
  displayText: string
  color: Nullable<string>
  startAt: string // ISO Time (THH:mm:ss)
  remindBefore: string // ISO Duration (PThhHmmMssS)
  remindAfter: string // ISO Duration (PThhHmmMssS)
  actionType: ReminderActionType
  actionTargetProjectId: Nullable<string>
  actionTargetActivityId: Nullable<string>
}

export type ReminderDeserializationAssets = Pick<
  ProjectsService,
  'projects' | 'activities'
>
