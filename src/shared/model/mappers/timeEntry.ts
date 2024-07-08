import type {
  CreateTimeEntry,
  TimeEntryDto,
  TimeEntryEntity,
  TimeEntryEntityInsert,
  UpdateTimeEntry,
} from '@shared/model/timeEntry'

export function toTimeEntryDto(timeEntry: TimeEntryEntity): TimeEntryDto {
  return timeEntry
}

export function timeEntryEntityCreateFrom(
  timeEntry: CreateTimeEntry,
): TimeEntryEntityInsert {
  return timeEntry
}

export function timeEntryEntityUpdateFrom(
  timeEntry: Partial<UpdateTimeEntry>,
): Partial<TimeEntryEntityInsert> {
  return timeEntry
}
