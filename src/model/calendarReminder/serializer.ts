import {isNull, type Nullable} from "@/lib/utils";
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/eventShadow";
import type {
  CalendarReminderContext,
  CalendarReminderInit,
  ReminderDeserializationAssets,
  SerializedCalendarReminder
} from "@/model/calendarReminder/types";
import {ReminderActionType} from "@/model/calendarReminder/types";
import {formatDuration, formatTime, parseDuration, parseTime} from "@/lib/neoTime";
import {whereId} from "@/lib/listUtils";

function getTargetShadow({
  projects,
  activities,
  actionType,
  targetProjectId,
  targetActivityId,
}: ReminderDeserializationAssets & {
  actionType: ReminderActionType
  targetProjectId: Nullable<string>
  targetActivityId: Nullable<string>
}) : Nullable<ReactiveCalendarEventShadow> {
  if (
    isNull(targetProjectId) ||
    [
      ReminderActionType.NO_ACTION,
      ReminderActionType.STOP_CURRENT_EVENT
    ].includes(actionType)
  ) {
    return null
  }

  const project = projects.find(whereId(targetProjectId)) ?? null

  if (isNull(project)) {
    // this should never happen lol
    return null
  }

  const activity = activities.find(whereId(targetActivityId)) ?? null

  return createEventShadow({
    project,
    activity
  })
}

export function fromSerializedReminder(serialized: SerializedCalendarReminder, assets: ReminderDeserializationAssets): CalendarReminderInit {
  return {
    id: serialized.id,
    displayText: serialized.displayText,
    color: serialized.color,
    startAt: parseTime(serialized.startAt),
    remindBefore: parseDuration(serialized.remindBefore),
    remindAfter: parseDuration(serialized.remindAfter),
    actionType: serialized.actionType,
    actionTargetShadow: getTargetShadow({
      ...assets,
      actionType: serialized.actionType,
      targetProjectId: serialized.actionTargetProjectId,
      targetActivityId: serialized.actionTargetActivityId,
    }),
  }
}

export function serializeReminder(reminder: CalendarReminderContext): SerializedCalendarReminder {
  return {
    id: reminder.id,
    displayText: reminder.displayText,
    color: reminder.color,
    startAt: formatTime(reminder.startAt),
    remindBefore: formatDuration(reminder.remindBefore),
    remindAfter: formatDuration(reminder.remindAfter),
    actionType: reminder.actionType,
    actionTargetProjectId: reminder.actionTargetShadow?.project?.id ?? null,
    actionTargetActivityId: reminder.actionTargetShadow?.activity?.id ?? null,
  }
}