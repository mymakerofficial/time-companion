import type { Maybe, Nullable } from '@renderer/lib/utils'
import { isNotNull, isNull } from '@renderer/lib/utils'
import type { ReactiveCalendarReminder } from '@renderer/model/calendarReminder/types'
import { ReminderActionType } from '@renderer/model/calendarReminder/types'
import { createReminder } from '@renderer/model/calendarReminder/model'
import { createEventShadow } from '@renderer/model/eventShadow/model'
import { minutes, timeNow } from '@renderer/lib/neoTime'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { ReactiveActivity } from '@renderer/model/activity/types'

export type ReminderFormState = Pick<
  ReactiveCalendarReminder,
  | 'displayText'
  | 'color'
  | 'startAt'
  | 'remindBefore'
  | 'remindAfter'
  | 'actionType'
> & {
  actionTargetProject: Nullable<ReactiveProject>
  actionTargetActivity: Nullable<ReactiveActivity>
}

export function createReminderForm(
  reminder?: Maybe<ReactiveCalendarReminder>,
): ReminderFormState {
  return {
    displayText: reminder?.displayText ?? '',
    color: reminder?.color ?? null,
    startAt: reminder?.startAt ?? timeNow(),
    remindBefore: reminder?.remindBefore ?? minutes(30),
    remindAfter: reminder?.remindAfter ?? minutes(30),
    actionType: reminder?.actionType ?? ReminderActionType.START_EVENT,
    actionTargetProject: reminder?.actionTargetShadow?.project ?? null,
    actionTargetActivity: reminder?.actionTargetShadow?.activity ?? null,
  }
}

export function createReminderFromForm(form: ReminderFormState) {
  const shadow =
    form.actionType === ReminderActionType.START_EVENT &&
    isNotNull(form.actionTargetProject)
      ? createEventShadow({
          project: form.actionTargetProject,
          activity: form.actionTargetActivity,
        })
      : null

  return createReminder({
    displayText: form.displayText,
    color: isNull(shadow) ? form.color : null,
    startAt: form.startAt,
    remindBefore: form.remindBefore,
    remindAfter: form.remindAfter,
    actionType: form.actionType,
    actionTargetShadow: shadow,
  })
}

export function patchReminderWithForm(
  reminder: ReactiveCalendarReminder,
  form: ReminderFormState,
) {
  reminder.displayText = form.displayText
  reminder.color =
    form.actionType !== ReminderActionType.START_EVENT ? form.color : null
  reminder.startAt = form.startAt
  reminder.remindBefore = form.remindBefore
  reminder.remindAfter = form.remindAfter
  reminder.actionType = form.actionType

  if (form.actionType !== ReminderActionType.START_EVENT) {
    reminder.actionTargetShadow = null
    return
  }

  if (isNull(form.actionTargetProject)) {
    return
  }

  if (isNull(reminder.actionTargetShadow)) {
    reminder.actionTargetShadow = createEventShadow({
      project: form.actionTargetProject,
      activity: form.actionTargetActivity,
    })
    return
  }

  reminder.actionTargetShadow.project = form.actionTargetProject
  reminder.actionTargetShadow.activity = form.actionTargetActivity
}
