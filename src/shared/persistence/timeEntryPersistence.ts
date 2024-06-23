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
import { firstOf, firstOfOrNull } from '@shared/lib/utils/list'
import { type DayDto, daysTable } from '@shared/model/day'
import { toDayDto } from '@shared/model/mappers/day'
import {
  check,
  IllegalStateError,
  isDefined,
  isEmpty,
  isNotNull,
} from '@shared/lib/utils/checks'
import { and } from '@shared/database/schema/columnDefinition'

class TimeEntryLowerBoundViolation extends IllegalStateError {
  constructor(expected: PlainDateTime, actual: PlainDateTime) {
    super(
      `Time entry must start at or after "${expected.toString()}". Received "${actual.toString()}".`,
    )
    this.name = 'TimeEntryLowerBoundViolation'
  }
}

class TimeEntryUpperBoundViolation extends IllegalStateError {
  constructor(expected: PlainDateTime, actual: PlainDateTime) {
    super(
      `Time entry must end at or before "${expected.toString()}". Received "${actual.toString()}".`,
    )
    this.name = 'TimeEntryUpperBoundViolation'
  }
}

class TimeEntryOverlapViolation extends IllegalStateError {
  constructor(firstTimeEntry: TimeEntryBase, secondTimeEntry: TimeEntryBase) {
    super(
      `Time entry must not overlap with an existing time entry. "${firstTimeEntry.startedAt.toString()}" - "${firstTimeEntry.stoppedAt?.toString() ?? null}" overlaps with "${secondTimeEntry.startedAt.toString()}" - "${secondTimeEntry.stoppedAt?.toString() ?? null}".`,
    )
    this.name = 'TimeEntryOverlapViolation'
  }
}

class TimeEntryStoppedBeforeStartedViolation extends IllegalStateError {
  constructor() {
    super('Time entry must start before it stops.')
    this.name = 'TimeEntryStoppedBeforeStartedViolation'
  }
}

class TimeEntryDurationViolation extends IllegalStateError {
  constructor() {
    super('Time entry must not be longer than 24 hours.')
    this.name = 'TimeEntryDurationViolation'
  }
}

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
      await checkConstraints(tx, timeEntry)

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

      await checkConstraints(tx, updatedTimeEntry, id)

      return updatedTimeEntry
    })
  }
}

/***
 * The upper bound represents the latest possible time a time entry can end.
 *  **Expects time entries to be sorted by startedAt in ascending order.**
 */
function calculateUpperBound(day: DayDto, timeEntries: Array<TimeEntryDto>) {
  if (isEmpty(timeEntries)) {
    // A time entry can at most be 24 hours long.
    //  The earliest time a time entry can start is at midnight.
    //  Therefore, if no other time entries exist, the upper bound is the end of the day.
    return day.date.toPlainDateTime().add({ hours: 24 })
  }

  const firstTimeEntry = firstOf(timeEntries)
  // A day may only last 24 starting from the first time entry.
  //  Therefore, the upper bound is 24 hours after the first entry has started.
  return firstTimeEntry.startedAt.add({ hours: 24 })
}

async function checkConstraints(
  tx: Transaction,
  timeEntry: TimeEntryBase,
  ignoreId?: string,
) {
  if (isNotNull(timeEntry.stoppedAt)) {
    check(
      timeEntry.startedAt.isBefore(timeEntry.stoppedAt),
      () => new TimeEntryStoppedBeforeStartedViolation(),
    )

    check(
      timeEntry.startedAt
        .until(timeEntry.stoppedAt)
        .isShorterThanOrEqual({ hours: 24 }),
      () => new TimeEntryDurationViolation(),
    )
  }

  const day = await tx.table(daysTable).findFirst({
    range: daysTable.id.range.only(timeEntry.dayId),
    map: toDayDto,
  })

  check(isNotNull(day), `Day with id "${timeEntry.dayId}" not found.`)

  const timeEntries = await tx.table(timeEntriesTable).findMany({
    range: timeEntriesTable.dayId.range.only(timeEntry.dayId),
    where: and(
      timeEntriesTable.deletedAt.isNull(),
      isDefined(ignoreId) ? timeEntriesTable.id.notEquals(ignoreId) : undefined,
    ),
    orderBy: timeEntriesTable.startedAt.asc(),
    map: toTimeEntryDto,
  })

  const lowerBound = day.date.toPlainDateTime()
  const upperBound = calculateUpperBound(day, timeEntries)

  const timeEntryEarliest = timeEntry.startedAt
  check(
    timeEntryEarliest.isAfterOrEqual(lowerBound),
    () => new TimeEntryLowerBoundViolation(lowerBound, timeEntryEarliest),
  )

  const timeEntryLatest = timeEntry.stoppedAt ?? timeEntry.startedAt
  check(
    timeEntryLatest.isBeforeOrEqual(upperBound),
    () => new TimeEntryUpperBoundViolation(upperBound, timeEntryLatest),
  )

  // If the time entry is still running,
  //  we assume the maximum possible duration of 24 hours.
  //  This way, no other time entry can overlap with it.
  const timeEntryAbsLatest =
    timeEntry.stoppedAt ?? timeEntry.startedAt.add({ hours: 24 })
  timeEntries.forEach((entry) => {
    const otherStart = entry.startedAt
    // same here, we assume the maximum possible duration of 24 hours.
    const otherAbsLatest = entry.stoppedAt ?? entry.startedAt.add({ hours: 24 })

    const overlaps =
      (timeEntryAbsLatest.isAfter(otherStart) &&
        timeEntryAbsLatest.isBefore(otherAbsLatest)) ||
      (timeEntryEarliest.isBefore(otherAbsLatest) &&
        timeEntryEarliest.isAfter(otherStart)) ||
      (otherStart.isBefore(timeEntryAbsLatest) &&
        otherAbsLatest.isAfter(timeEntryEarliest))

    if (overlaps) {
      throw new TimeEntryOverlapViolation(timeEntry, entry)
    }
  })
}
