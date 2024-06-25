import type { Database, Transaction } from '@database/types/database'
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
import { daysTable } from '@shared/model/day'
import { toDayDto } from '@shared/model/mappers/day'
import {
  check,
  IllegalStateError,
  isDefined,
  isEmpty,
  isNotNull,
} from '@shared/lib/utils/checks'
import { and } from '@database/schema/columnDefinition'
import type { Nullable } from '@shared/lib/utils/types'
import { Duration } from '@shared/lib/datetime/duration'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@database/types/errors'

class TimeEntryUniqueViolation extends IllegalStateError {
  constructor(columnName: string, value: string) {
    super(`Time Entry with ${columnName} "${value}" already exists.`)
    this.name = 'TimeEntryUniqueViolation'
  }
}

class TimeEntryUndefinedFieldViolation extends IllegalStateError {
  constructor(columnName: string) {
    super(
      `Tried to set value for undefined field "${columnName}" on time entry.`,
    )
    this.name = 'TimeEntryUndefinedFieldViolation'
  }
}

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
  getTimeEntryById(id: string): Promise<Nullable<TimeEntryDto>>
  getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>>
  getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>>
  getRunningTimeEntryByDayId(dayId: string): Promise<Nullable<TimeEntryDto>>
  createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto>
  patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto>
  softDeleteTimeEntry(id: string): Promise<void>
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

  async getTimeEntryById(id: string): Promise<Nullable<TimeEntryDto>> {
    return await this.database
      .table(timeEntriesTable)
      .findFirst({
        range: timeEntriesTable.id.range.only(id),
        where: timeEntriesTable.deletedAt.isNull(),
        map: toTimeEntryDto,
      })
      .catch(resolveError)
  }

  async getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>> {
    return await this.database
      .table(timeEntriesTable)
      .findMany({
        range: timeEntriesTable.dayId.range.only(dayId),
        where: timeEntriesTable.deletedAt.isNull(),
        orderBy: timeEntriesTable.startedAt.asc(),
        map: toTimeEntryDto,
      })
      .catch(resolveError)
  }

  async getRunningTimeEntryByDayId(
    dayId: string,
  ): Promise<Nullable<TimeEntryDto>> {
    return await this.database
      .table(timeEntriesTable)
      .findFirst({
        range: timeEntriesTable.dayId.range.only(dayId),
        where: and(
          timeEntriesTable.deletedAt.isNull(),
          timeEntriesTable.stoppedAt.isNull(),
        ),
        map: toTimeEntryDto,
      })
      .catch(resolveError)
  }

  async getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>> {
    return await this.database
      .table(timeEntriesTable)
      .findMany({
        range: timeEntriesTable.startedAt.range.between(
          startedAt.toDate(),
          stoppedAt.toDate(),
        ),
        where: timeEntriesTable.deletedAt.isNull(),
        map: toTimeEntryDto,
      })
      .catch(resolveError)
  }

  async createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto> {
    return await this.database.withTransaction(async (tx) => {
      await checkConstraints(tx, timeEntry)

      return await tx
        .table(timeEntriesTable)
        .insert({
          data: timeEntryEntityCreateFrom(timeEntry, {
            id: uuid(),
            createdAt: PlainDateTime.now(),
          }),
          map: toTimeEntryDto,
        })
        .catch(resolveError)
    })
  }

  async patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    return await this.database.withTransaction(async (tx) => {
      return await tx
        .table(timeEntriesTable)
        .update({
          range: timeEntriesTable.id.range.only(id),
          where: timeEntriesTable.deletedAt.isNull(),
          data: timeEntryEntityUpdateFrom(timeEntry, {
            modifiedAt: PlainDateTime.now(),
          }),
          map: toTimeEntryDto,
        })
        .catch(resolveError)
        .then(firstOfOrNull)
        .then((res) => {
          check(isNotNull(res), `Time entry with id "${id}" not found.`)
          return res
        })
        .then(async (res) => {
          await checkConstraints(tx, res, id)
          return res
        })
    })
  }

  async softDeleteTimeEntry(id: string): Promise<void> {
    const res = await this.database.table(timeEntriesTable).update({
      range: timeEntriesTable.id.range.only(id),
      data: {
        deletedAt: new Date(),
      },
    })

    check(isNotNull(res), `Time entry with id "${id}" not found.`)
  }
}

function resolveError(error: DatabaseError): never {
  if (errorIsUniqueViolation(error)) {
    throw new TimeEntryUniqueViolation(error.columnName, error.value)
  }

  if (errorIsUndefinedColumn(error)) {
    throw new TimeEntryUndefinedFieldViolation(error.columnName)
  }

  throw error
}

const TIME_ENTRY_MAX_DURATION = Duration.from({ hours: 24 })
const ONE_DAY = Duration.from({ days: 1 })

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
        .isShorterThanOrEqual(TIME_ENTRY_MAX_DURATION),
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
      // Ignore the time entry we are currently updating.
      isDefined(ignoreId) ? timeEntriesTable.id.notEquals(ignoreId) : undefined,
    ),
    orderBy: timeEntriesTable.startedAt.asc(),
    map: toTimeEntryDto,
  })

  const lowerBound = day.date.toPlainDateTime()
  const timeEntryEarliest = timeEntry.startedAt
  check(
    timeEntryEarliest.isAfterOrEqual(lowerBound),
    () => new TimeEntryLowerBoundViolation(lowerBound, timeEntryEarliest),
  )

  if (isEmpty(timeEntries)) {
    // The first time entry added to a day must start during on the given date.
    const upperBound = day.date.toPlainDateTime().add(ONE_DAY)
    check(
      timeEntry.startedAt.isBeforeOrEqual(upperBound),
      () => new TimeEntryUpperBoundViolation(upperBound, timeEntry.startedAt),
    )
  } else {
    // A day may only last 24 hours starting from the first time entry.
    //  Therefore, the upper bound is the maximum entry duration
    //  after the first entry has started.
    const firstTimeEntry = firstOf(timeEntries)
    const upperBound = firstTimeEntry.startedAt.add(TIME_ENTRY_MAX_DURATION)
    const timeEntryLatest = timeEntry.stoppedAt ?? timeEntry.startedAt
    check(
      timeEntryLatest.isBeforeOrEqual(upperBound),
      () => new TimeEntryUpperBoundViolation(upperBound, timeEntryLatest),
    )
  }

  // If the time entry is still running,
  //  we assume the maximum possible duration.
  //  This way, no other time entry can overlap with it.
  const timeEntryAbsLatest =
    timeEntry.stoppedAt ?? timeEntry.startedAt.add(TIME_ENTRY_MAX_DURATION)
  timeEntries.forEach((entry) => {
    const otherStart = entry.startedAt
    // same here, we assume the maximum possible duration.
    const otherAbsLatest =
      entry.stoppedAt ?? entry.startedAt.add(TIME_ENTRY_MAX_DURATION)

    const overlaps =
      (timeEntryAbsLatest.isAfter(otherStart) &&
        timeEntryAbsLatest.isBefore(otherAbsLatest)) ||
      (timeEntryEarliest.isBefore(otherAbsLatest) &&
        timeEntryEarliest.isAfter(otherStart)) ||
      (otherStart.isBefore(timeEntryAbsLatest) &&
        otherAbsLatest.isAfter(timeEntryEarliest))

    check(!overlaps, () => new TimeEntryOverlapViolation(timeEntry, entry))
  })
}
