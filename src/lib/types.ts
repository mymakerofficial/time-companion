import { v4 as uuid } from 'uuid'
import type {Nullable} from "@/lib/utils";

export interface HasId {
  id: string
}

export interface CalendarEvent extends HasId {
  projectDisplayName: Nullable<string>
  activityDisplayName: Nullable<string>
  privateNote: Nullable<string>
  color: Nullable<string>
  repeats: boolean
  isBreak: boolean
  startedAt: Date
  endedAt: Nullable<Date>
}

export function calendarEvent(partial: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: uuid(),
    projectDisplayName: null,
    activityDisplayName: null,
    privateNote: null,
    color: null,
    repeats: false,
    isBreak: false,
    startedAt: new Date(),
    endedAt: null,
    ...partial,
  }
}

export interface CalendarReminder extends HasId {
  displayName: string
  remindAt: Date
  remindBeforeMinutes: number
  remindAfterMinutes: number
  actionLabel: Nullable<string>
  onAction: Nullable<() => void>
  dismissAfterAction: boolean
  isDismissed: boolean
  color: Nullable<string>
}

export function calendarReminder(partial: Partial<CalendarReminder>): CalendarReminder {
  return {
    id: uuid(),
    displayName: '',
    remindAt: new Date(),
    remindBeforeMinutes: 0,
    remindAfterMinutes: 0,
    actionLabel: null,
    onAction: null,
    dismissAfterAction: true,
    isDismissed: false,
    color: null,
    ...partial,
  }
}