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