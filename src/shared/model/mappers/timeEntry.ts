import type {
  CreateTimeEntry,
  TimeEntryDto,
  TimeEntryEntity,
  UpdateTimeEntry,
} from '@shared/model/timeEntry'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { HasId } from '@shared/model/helpers/hasId'
import { acceptNull } from '@shared/lib/utils/acceptNull'
import { isDefined, isNotNull } from '@shared/lib/utils/checks'

export function toTimeEntryDto(timeEntry: TimeEntryEntity): TimeEntryDto {
  return {
    id: timeEntry.id,
    dayId: timeEntry.dayId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    description: timeEntry.description,
    startedAt: PlainDateTime.from(timeEntry.startedAt),
    stoppedAt: acceptNull(PlainDateTime.from)(timeEntry.stoppedAt),
    createdAt: PlainDateTime.from(timeEntry.createdAt),
    modifiedAt: acceptNull(PlainDateTime.from)(timeEntry.modifiedAt),
    deletedAt: acceptNull(PlainDateTime.from)(timeEntry.deletedAt),
  }
}

export function timeEntryEntityCreateFrom(
  timeEntry: CreateTimeEntry,
  base: HasId,
): TimeEntryEntity {
  return {
    id: base.id,
    dayId: timeEntry.dayId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    description: timeEntry.description,
    startedAt: timeEntry.startedAt.toDate(),
    stoppedAt: timeEntry.stoppedAt?.toDate() ?? null,
  }
}

export function timeEntryEntityUpdateFrom(
  timeEntry: Partial<UpdateTimeEntry>,
): Partial<TimeEntryEntity> {
  return {
    dayId: timeEntry.dayId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    description: timeEntry.description,
    startedAt: timeEntry.startedAt?.toDate(),
    stoppedAt: isDefined(timeEntry.stoppedAt)
      ? isNotNull(timeEntry.stoppedAt)
        ? timeEntry.stoppedAt.toDate()
        : null
      : undefined, // beautiful
  }
}
