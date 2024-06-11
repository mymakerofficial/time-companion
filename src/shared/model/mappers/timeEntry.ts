import type { TimeEntryDto, TimeEntryEntity } from '@shared/model/timeEntry'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export function toTimeEntryDto(timeEntry: TimeEntryEntity): TimeEntryDto {
  return {
    id: timeEntry.id,
    dayId: timeEntry.dayId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    description: timeEntry.description,
    startedAt: PlainDateTime.from(timeEntry.startedAt),
    stoppedAt: timeEntry.stoppedAt
      ? PlainDateTime.from(timeEntry.stoppedAt)
      : null,
    createdAt: PlainDateTime.from(timeEntry.createdAt),
    modifiedAt: timeEntry.modifiedAt
      ? PlainDateTime.from(timeEntry.modifiedAt)
      : null,
    deletedAt: timeEntry.deletedAt
      ? PlainDateTime.from(timeEntry.deletedAt)
      : null,
  }
}
