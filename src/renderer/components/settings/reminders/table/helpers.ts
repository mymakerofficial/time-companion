import type { ReactiveCalendarReminder } from '@renderer/model/calendarReminder/types'
import type { ReminderRow } from '@renderer/components/settings/reminders/table/types'

export function toReminderRow(reminder: ReactiveCalendarReminder): ReminderRow {
  return {
    id: reminder.id,
    name: reminder.displayText,
    startAt: reminder.startAt,
    action: {
      type: reminder.actionType,
      targetProject: reminder.actionTargetShadow?.project ?? null,
      targetActivity: reminder.actionTargetShadow?.activity ?? null,
    },
  }
}
