import {ReminderActionType} from "@/model/calendarReminder";

export const typeNames: Record<ReminderActionType, string> = {
  [ReminderActionType.NO_ACTION]: 'No action',
  [ReminderActionType.START_EVENT]: 'Start event',
  [ReminderActionType.CONTINUE_PREVIOUS_EVENT]: 'Continue previous event',
  [ReminderActionType.STOP_CURRENT_EVENT]: 'Stop current event',
}