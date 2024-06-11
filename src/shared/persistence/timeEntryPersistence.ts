import type { Database } from '@shared/database/types/database'
import {
  type CreateTimeEntry,
  timeEntriesTable,
  type TimeEntryDto,
  type UpdateTimeEntry,
} from '@shared/model/timeEntry'
import { toTimeEntryDto } from '@shared/model/mappers/timeEntry'
import { type PlainDateTime } from '@shared/lib/datetime/plainDateTime'
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
    const { startedAt, stoppedAt, ...rest } = timeEntry

    return await this.database.table(timeEntriesTable).insert({
      data: {
        id: uuid(),
        ...rest,
        startedAt: startedAt.toDate(),
        stoppedAt: stoppedAt?.toDate() ?? null,
        createdAt: new Date(),
        modifiedAt: null,
        deletedAt: null,
      },
      map: toTimeEntryDto,
    })
  }

  async patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    const { startedAt, stoppedAt, ...rest } = timeEntry

    return firstOf(
      await this.database.table(timeEntriesTable).update({
        range: timeEntriesTable.id.range.only(id),
        where: timeEntriesTable.deletedAt.isNull(),
        data: {
          ...rest,
          startedAt: startedAt?.toDate(),
          stoppedAt: stoppedAt?.toDate(),
          modifiedAt: new Date(),
        },
        map: toTimeEntryDto,
      }),
    )
  }
}
