import type { Database, Transaction } from '@shared/database/types/database'
import {
  type CreateTimeEntry,
  timeEntriesTable,
  type TimeEntryBase,
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
import { type DayDto, daysTable } from '@shared/model/day'
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
      await checkConstraints(timeEntry, tx)

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

      await checkConstraints(updatedTimeEntry, tx)

      return updatedTimeEntry
    })
  }
}

async function checkConstraints(timeEntry: TimeEntryBase, tx: Transaction) {
  checkDateTimeRange(timeEntry)
  const day = await checkDay(timeEntry, tx)
  await checkDateTimeLimit(timeEntry, day, tx)
  await checkOverlap(timeEntry, tx)
}

function checkDateTimeRange({
  startedAt,
  stoppedAt,
}: Pick<TimeEntryBase, 'startedAt' | 'stoppedAt'>) {
  if (isNull(stoppedAt)) {
    // Time entry is still running, no need to check the stoppedAt date.
    return
  }

  check(startedAt.isBefore(stoppedAt), `Time entry must start before it stops.`)

  check(
    startedAt.until(stoppedAt).isShorterThan({ hours: 24 }),
    `Time entry must not be longer than 24 hours.`,
  )
}

async function checkDay(timeEntry: TimeEntryBase, tx: Transaction) {
  const { startedAt, dayId } = timeEntry

  const day = await tx.table(daysTable).findFirst({
    range: daysTable.id.range.only(dayId),
    map: toDayDto,
  })

  check(isNotNull(day), `Day with id "${dayId}" not found.`)

  check(
    startedAt.isAfterOrEqual(day.date),
    `Time entry must start after midnight of the given day.`,
  )

  return day
}

async function checkDateTimeLimit(
  timeEntry: TimeEntryBase,
  day: DayDto,
  tx: Transaction,
) {
  const { startedAt, stoppedAt } = timeEntry

  const earliestTimeEntry = await tx.table(timeEntriesTable).findFirst({
    range: timeEntriesTable.dayId.range.only(timeEntry.dayId),
    orderBy: timeEntriesTable.startedAt.asc(),
    map: toTimeEntryDto,
  })

  if (isNull(earliestTimeEntry)) {
    // This is the first time entry of the day.
    check(
      startedAt.isBefore(day.date.add({ days: 1 })),
      `The first time entry of a day must start on the same date.`,
    )
  } else {
    check(
      earliestTimeEntry.startedAt
        .add({ hours: 24 })
        .isAfterOrEqual(stoppedAt ?? startedAt),
      `Time entry must end at most 24 hours after the first time entry of the given day has started.`,
    )
  }
}

async function checkOverlap(timeEntry: TimeEntryBase, tx: Transaction) {
  const lowerBound = timeEntry.startedAt.subtract({ hours: 24 })
  const upperBound = timeEntry.stoppedAt ?? timeEntry.startedAt

  const collision = await tx.table(timeEntriesTable).findFirst({
    range: timeEntriesTable.startedAt.range.between(
      lowerBound.toDate(),
      upperBound.toDate(),
    ),
    where: or(
      timeEntriesTable.stoppedAt.isNull(),
      or(
        and(
          timeEntriesTable.startedAt.lessThan(timeEntry.startedAt.toDate()),
          timeEntriesTable.stoppedAt.greaterThan(timeEntry.startedAt.toDate()),
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

  if (isNull(collision)) {
    // all good
    return
  }

  if (isNull(collision.stoppedAt)) {
    throw new IllegalStateError(
      'Cannot create a time entry while another time entry is running.',
    )
  }

  throw new IllegalStateError(
    'Time entry must not overlap with an existing time entry.',
  )
}
