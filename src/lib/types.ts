import { v4 as uuid } from 'uuid'

export interface CalendarEvent {
  id: string
  projectDisplayName: string | null
  activityDisplayName: string | null
  privateNote: string | null
  color: string | null
  repeats: boolean
  isBreak: boolean
  startedAt: Date
  endedAt: Date | null
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

export interface CalendarReminder {
  id: string
  displayName: string
  remindAt: Date
  remindBeforeMins: number
  remindAfterMins: number
  buttonLabel: string | null
  buttonAction: (() => void) | null
  color: string
}