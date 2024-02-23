import type {ReactiveCalendarReminder} from "@/model/calendarReminder/types";
import {ReminderActionType} from "@/model/calendarReminder/types";
import type {Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveActivity} from "@/model/activity/types";

export interface ReminderRow {
  id: string
  name: string
  startAt: ReactiveCalendarReminder['startAt']
  action: {
    type: ReminderActionType,
    targetProject: Nullable<ReactiveProject>,
    targetActivity: Nullable<ReactiveActivity>,
  }
}