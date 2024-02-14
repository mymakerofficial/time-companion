import {ReminderActionType} from "@/model/calendarReminder";
import type {Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import type {LocalTime} from "@js-joda/core";

export interface ReminderRow {
  id: string
  name: string
  startAt: LocalTime
  action: {
    type: ReminderActionType,
    targetProject: Nullable<ReactiveProject>,
    targetActivity: Nullable<ReactiveActivity>,
  }
}