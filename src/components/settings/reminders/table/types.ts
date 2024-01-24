import type {RepeatOnWeekdays} from "@/model/calendarReminder";
import {ReminderActionType} from "@/model/calendarReminder";
import type {Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";

export interface ReminderRow {
  id: string
  name: string
  remindAt: Date
  repeatOn: RepeatOnWeekdays,
  action: {
    type: ReminderActionType,
    targetProject: Nullable<ReactiveProject>,
    targetActivity: Nullable<ReactiveActivity>,
  }
}