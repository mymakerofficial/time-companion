import type {Maybe, Nullable} from "@/lib/utils";
import {
  createReminder,
  createRepeatOnWeekdays,
  type ReactiveCalendarReminder,
  ReminderActionType,
  type RepeatOnWeekdays
} from "@/model/calendarReminder";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import {createEventShadow} from "@/model/calendarEventShadow";
import {minutesSinceStartOfDay, minutesSinceStartOfDayToDate} from "@/lib/timeUtils";
import {isDefined, isNotNull, isNull} from "@/lib/utils";

export interface ReminderFormState {
  displayText: ReactiveCalendarReminder['displayText'],
  color: ReactiveCalendarReminder['color'],
  remindAtMinutes: number,
  remindMinutesBefore: number,
  remindMinutesAfter: number,
  repeatOn: RepeatOnWeekdays,
  actionType: ReminderActionType,
  actionTargetProject: Nullable<ReactiveProject>,
  actionTargetActivity: Nullable<ReactiveActivity>,
}

export function createReminderForm(reminder?: Maybe<ReactiveCalendarReminder>): ReminderFormState {
  return {
    displayText: reminder?.displayText ?? '',
    color: reminder?.color ?? null,
    remindAtMinutes: isDefined(reminder) ? minutesSinceStartOfDay(reminder.remindAt) : 720,
    remindMinutesBefore: reminder?.remindMinutesBefore ?? 30,
    remindMinutesAfter: reminder?.remindMinutesAfter ?? 30,
    repeatOn: reminder?.repeatOn ?? createRepeatOnWeekdays([true, true, true, true, true, false, false]),
    actionType: reminder?.actionType ?? ReminderActionType.START_EVENT,
    actionTargetProject: reminder?.actionTargetShadow?.project ?? null,
    actionTargetActivity: reminder?.actionTargetShadow?.activity ?? null,
  }
}

export function createReminderFromForm(form: ReminderFormState) {
  const shadow = form.actionType === ReminderActionType.START_EVENT &&  isNotNull(form.actionTargetProject) ? createEventShadow({
    project: form.actionTargetProject,
    activity: form.actionTargetActivity,
  }) : null

  return createReminder({
    displayText: form.displayText,
    color: isNull(shadow) ? form.color : null,
    remindAt: minutesSinceStartOfDayToDate(form.remindAtMinutes),
    remindMinutesBefore: form.remindMinutesBefore,
    remindMinutesAfter: form.remindMinutesAfter,
    repeatOn: form.repeatOn,
    actionType: form.actionType,
    actionTargetShadow: shadow
  })
}

export function patchReminderWithForm(reminder: ReactiveCalendarReminder, form: ReminderFormState) {
  const shadow = form.actionType === ReminderActionType.START_EVENT && isNotNull(form.actionTargetProject) ? createEventShadow({
    project: form.actionTargetProject,
    activity: form.actionTargetActivity,
  }) : null

  reminder.displayText = form.displayText
  reminder.color = isNull(shadow) ? form.color : null
  reminder.remindAt = minutesSinceStartOfDayToDate(form.remindAtMinutes)
  reminder.remindMinutesBefore = form.remindMinutesBefore
  reminder.remindMinutesAfter = form.remindMinutesAfter
  reminder.repeatOn = form.repeatOn
  reminder.actionType = form.actionType
  reminder.actionTargetShadow = shadow
}