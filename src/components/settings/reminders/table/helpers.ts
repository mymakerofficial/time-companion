import type {ReactiveCalendarReminder} from "@/model/calendarReminder";
import type {ReminderRow} from "@/components/settings/reminders/table/types";

export function toReminderRow(reminder: ReactiveCalendarReminder): ReminderRow {
  return {
    id: reminder.id,
    name: reminder.displayText,
    remindAt: reminder.remindAt,
    repeatOn: reminder.repeatOn,
    action: {
      type: reminder.actionType,
      targetProject: reminder.actionTargetShadow?.project ?? null,
      targetActivity: reminder.actionTargetShadow?.activity ?? null,
    }
  }
}