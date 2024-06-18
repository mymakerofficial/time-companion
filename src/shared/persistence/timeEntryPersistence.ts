import type { Database } from '@shared/database/types/database'
import {
  type CreateTimeEntry,
  timeEntriesTable,
  type TimeEntryDto,
  type UpdateTimeEntry,
} from '@shared/model/timeEntry'
import {
  timeEntryEntityCreateFrom,
  timeEntryEntityUpdateFrom,
  toTimeEntryDto,
} from '@shared/model/mappers/timeEntry'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { uuid } from '@shared/lib/utils/uuid'
import { firstOfOrNull } from '@shared/lib/utils/list'
import { daysTable } from '@shared/model/day'
import { toDayDto } from '@shared/model/mappers/day'
import {
  check,
  IllegalStateError,
  isNotNull,
  isNull,
} from '@shared/lib/utils/checks'
import { and, or } from '@shared/database/schema/columnDefinition'

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
    return await this.database.withTransaction(async (tx) => {
      if (isNotNull(timeEntry.stoppedAt)) {
        check(
          timeEntry.startedAt.isBefore(timeEntry.stoppedAt),
          `Time entry must start before it stops.`,
        )

        check(
          timeEntry.startedAt
            .until(timeEntry.stoppedAt)
            .isShorterThan({ hours: 24 }),
          `Time entry must not be longer than 24 hours.`,
        )
      }

      const day = await tx.table(daysTable).findFirst({
        range: daysTable.id.range.only(timeEntry.dayId),
        map: toDayDto,
      })

      check(isNotNull(day), `Day with id "${timeEntry.dayId}" not found.`)

      check(
        timeEntry.startedAt.isAfterOrEqual(day.date),
        `Time entry must start after midnight of the given day.`,
      )

      const earliestTimeEntry = await tx.table(timeEntriesTable).findFirst({
        range: timeEntriesTable.dayId.range.only(day.id),
        orderBy: timeEntriesTable.startedAt.asc(),
        map: toTimeEntryDto,
      })

      if (isNotNull(earliestTimeEntry)) {
        check(
          earliestTimeEntry.startedAt
            .add({ hours: 24 })
            .isAfter(timeEntry.stoppedAt ?? timeEntry.startedAt),
          `Time entry must end at most 24 hours after the first time entry of the given day.`,
        )

        const collidingTimeEntry = await tx.table(timeEntriesTable).findFirst({
          range: timeEntriesTable.startedAt.range.between(
            timeEntry.startedAt.subtract({ hours: 24 }).toDate(),
            timeEntry.startedAt.add({ hours: 24 }).toDate(),
          ),
          where: or(
            timeEntriesTable.stoppedAt.isNull(),
            or(
              and(
                timeEntriesTable.startedAt.lessThan(
                  timeEntry.startedAt.toDate(),
                ),
                timeEntriesTable.stoppedAt.greaterThan(
                  timeEntry.startedAt.toDate(),
                ),
              ),
              and(
                timeEntriesTable.startedAt.lessThan(
                  timeEntry.stoppedAt?.toDate() ?? timeEntry.startedAt.toDate(),
                ),
                timeEntriesTable.stoppedAt.greaterThan(
                  timeEntry.stoppedAt?.toDate() ?? timeEntry.startedAt.toDate(),
                ),
              ),
            ),
          ),
          map: toTimeEntryDto,
        })

        if (isNotNull(collidingTimeEntry)) {
          if (collidingTimeEntry.stoppedAt === null) {
            throw new IllegalStateError(
              'Cannot create a time entry while another time entry is running.',
            )
          }

          throw new IllegalStateError(
            'Time entry must not overlap with an existing time entry.',
          )
        }
      } else {
        check(
          timeEntry.startedAt.isBefore(day.date.add({ days: 1 })),
          `The first time entry of a day must start on the same date.`,
        )
      }

      return await tx.table(timeEntriesTable).insert({
        data: timeEntryEntityCreateFrom(timeEntry, {
          id: uuid(),
          createdAt: PlainDateTime.now(),
        }),
        map: toTimeEntryDto,
      })
    })
  }

  async patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    return await this.database.withTransaction(async (tx) => {
      const updatedTimeEntry = firstOfOrNull(
        await tx.table(timeEntriesTable).update({
          range: timeEntriesTable.id.range.only(id),
          where: timeEntriesTable.deletedAt.isNull(),
          data: timeEntryEntityUpdateFrom(timeEntry, {
            modifiedAt: PlainDateTime.now(),
          }),
          map: toTimeEntryDto,
        }),
      )

      check(
        isNotNull(updatedTimeEntry),
        `Time entry with id "${id}" not found.`,
      )

      check(
        isNull(updatedTimeEntry.stoppedAt) ||
          updatedTimeEntry.startedAt.isBefore(updatedTimeEntry.stoppedAt),
        `Time entry must start before it stops.`,
      )

      const day = await tx.table(daysTable).findFirst({
        range: daysTable.id.range.only(updatedTimeEntry.dayId),
        map: toDayDto,
      })

      check(
        isNotNull(day),
        `Day with id "${updatedTimeEntry.dayId}" not found.`,
      )

      check(
        updatedTimeEntry.startedAt.isAfterOrEqual(day.date),
        `Time entry must start after midnight of the given day.`,
      )

      return updatedTimeEntry
    })
  }
}
