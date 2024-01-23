import type {ReactiveCalendarReminder} from "@/model/calendarReminder";
import type {ReminderRow} from "@/components/settings/reminders/table/types";

export function toReminderRow(reminder: ReactiveCalendarReminder): ReminderRow {
  return {
    id: reminder.id,
    name: reminder.displayText,
  }
}