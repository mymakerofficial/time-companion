import type {
  CreateTimeEntry,
  TimeEntryDto,
  TimeEntryEntity,
  UpdateTimeEntry,
} from '@shared/model/timeEntry'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasId } from '@shared/model/helpers/hasId'
import { acceptNull } from '@shared/lib/utils/acceptNull'

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
  base: HasId & HasCreatedAt,
): TimeEntryEntity {
  return {
    id: base.id,
    dayId: timeEntry.dayId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    description: timeEntry.description,
    startedAt: timeEntry.startedAt.toDate(),
    stoppedAt: timeEntry.stoppedAt?.toDate() ?? null,
    createdAt: base.createdAt.toDate(),
    modifiedAt: null,
    deletedAt: null,
  }
}

export function timeEntryEntityUpdateFrom(
  timeEntry: Partial<UpdateTimeEntry>,
  base: Partial<BaseDto>,
): Partial<TimeEntryEntity> {
  return {
    id: base?.id,
    dayId: timeEntry.dayId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    description: timeEntry.description,
    startedAt: timeEntry.startedAt?.toDate(),
    stoppedAt: timeEntry.stoppedAt?.toDate(),
    createdAt: base.createdAt?.toDate(),
    modifiedAt: base.modifiedAt?.toDate(),
    deletedAt: base.deletedAt?.toDate(),
  }
}
