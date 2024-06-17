import type { Database } from '@shared/database/types/database'
import {
  type CreateTimeEntry,
  timeEntriesTable,
  type TimeEntryDto,
  type UpdateTimeEntry,
} from '@shared/model/timeEntry'
import {
  toTimeEntryDto,
  timeEntryEntityUpdateFrom,
  timeEntryEntityCreateFrom,
} from '@shared/model/mappers/timeEntry'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { uuid } from '@shared/lib/utils/uuid'
import { firstOf } from '@shared/lib/utils/list'

export type TimeEntryPersistenceDependencies = {
  database: Database
}

export interface TimeEntryPersistence {
  getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>>
  getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>>
  createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto>
  patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto>
}

export function createTimeEntryPersistence(
  deps: TimeEntryPersistenceDependencies,
): TimeEntryPersistence {
  return new TimeEntryPersistenceImpl(deps)
}

class TimeEntryPersistenceImpl implements TimeEntryPersistence {
  private readonly database: Database

  constructor(deps: TimeEntryPersistenceDependencies) {
    this.database = deps.database
  }

  async getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>> {
    return await this.database.table(timeEntriesTable).findMany({
      range: timeEntriesTable.dayId.range.only(dayId),
      where: timeEntriesTable.deletedAt.isNull(),
      orderBy: timeEntriesTable.startedAt.asc(),
      map: toTimeEntryDto,
    })
  }

  async getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>> {
    return await this.database.table(timeEntriesTable).findMany({
      range: timeEntriesTable.startedAt.range.between(
        startedAt.toDate(),
        stoppedAt.toDate(),
      ),
      where: timeEntriesTable.deletedAt.isNull(),
      map: toTimeEntryDto,
    })
  }

  async createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto> {
    return await this.database.table(timeEntriesTable).insert({
      data: timeEntryEntityCreateFrom(timeEntry, {
        id: uuid(),
        createdAt: PlainDateTime.now(),
      }),
      map: toTimeEntryDto,
    })
  }

  async patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    const res = await this.database.table(timeEntriesTable).update({
      range: timeEntriesTable.id.range.only(id),
      where: timeEntriesTable.deletedAt.isNull(),
      data: timeEntryEntityUpdateFrom(timeEntry, {
        modifiedAt: PlainDateTime.now(),
      }),
      map: toTimeEntryDto,
    })

    return firstOf(res)
  }
}
