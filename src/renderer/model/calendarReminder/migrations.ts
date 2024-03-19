import type { SerializedCalendarReminder } from '@renderer/model/calendarReminder/types'
import { defineMigrator } from '@renderer/lib/migrations'

function upgradeVersion0(original: any): any {
  return {
    id: original.id,
    displayText: original.displayText,
    color: original.color,
    startAt: original.remindAt.substring(1),
    remindBefore: `PT${original.remindMinutesBefore}M`,
    remindAfter: `PT${original.remindMinutesAfter}M`,
    actionType: original.actionType,
    actionTargetProjectId: original.actionTargetProjectId,
    actionTargetActivityId: original.actionTargetActivityId,
  }
}

export const migrateSerializedReminder =
  defineMigrator<SerializedCalendarReminder>([upgradeVersion0])
