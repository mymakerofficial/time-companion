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
  isNotEmpty,
  isNotNull,
  isNull,
} from '@shared/lib/utils/checks'
import type { Nullable } from '@shared/lib/utils/types'
import { Duration } from '@shared/lib/datetime/duration'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@database/types/errors'
import type { Database, Transaction } from '@shared/drizzle/database'
import { and, asc, count, eq, isNull as colIsNull, ne } from 'drizzle-orm'
import { todo } from '@shared/lib/utils/todo'

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

class TimeEntryMultipleRunningViolation extends IllegalStateError {
  constructor() {
    super('Cannot have multiple running time entries.')
    this.name = 'TimeEntryMultipleRunningViolation'
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
  getRunningTimeEntry(
    lowerBound?: PlainDateTime,
    upperBound?: PlainDateTime,
  ): Promise<Nullable<TimeEntryDto>>
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
    const res = await this.database
      .select()
      .from(timeEntriesTable)
      .where(eq(timeEntriesTable.id, id))
      .limit(1)
    return firstOfOrNull(res.map(toTimeEntryDto))
  }

  async getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>> {
    const res = await this.database
      .select()
      .from(timeEntriesTable)
      .where(
        and(
          eq(timeEntriesTable.dayId, dayId),
          colIsNull(timeEntriesTable.deletedAt),
        ),
      )
      .orderBy(asc(timeEntriesTable.startedAt))
    return res.map(toTimeEntryDto)
  }

  async getRunningTimeEntry(
    lowerBound?: PlainDateTime,
    upperBound?: PlainDateTime,
  ): Promise<Nullable<TimeEntryDto>> {
    const res = await this.database
      .select()
      .from(timeEntriesTable)
      .where(
        and(
          colIsNull(timeEntriesTable.stoppedAt),
          colIsNull(timeEntriesTable.deletedAt),
        ),
      )
      .limit(1)
    return firstOfOrNull(res.map(toTimeEntryDto))
  }

  async getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>> {
    todo()
  }

  async createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto> {
    return await this.database.transaction(async (tx) => {
      await checkConstraints(tx, timeEntry)

      const res = await tx
        .insert(timeEntriesTable)
        .values(
          timeEntryEntityCreateFrom(timeEntry, {
            id: uuid(),
          }),
        )
        .returning()
      return firstOf(res.map(toTimeEntryDto))
    })
  }

  async patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    return await this.database.transaction(async (tx) => {
      const res = await tx
        .update(timeEntriesTable)
        .set(timeEntryEntityUpdateFrom(timeEntry))
        .where(
          and(
            eq(timeEntriesTable.id, id),
            colIsNull(timeEntriesTable.deletedAt),
          ),
        )
        .returning()
        .then((res) => firstOfOrNull(res.map(toTimeEntryDto)))

      check(isNotNull(res), `Time entry with id "${id}" not found.`)

      await checkConstraints(tx, res, id)

      return res
    })
  }

  async softDeleteTimeEntry(id: string): Promise<void> {
    const res = await this.database
      .update(timeEntriesTable)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(eq(timeEntriesTable.id, id), colIsNull(timeEntriesTable.deletedAt)),
      )
      .returning()
    check(isNotEmpty(res), `Time entry with id "${id}" not found.`)
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
  } else {
    // Check if there is already a running time entry.
    const runningTimeEntry = await tx
      .select({ id: timeEntriesTable.id })
      .from(timeEntriesTable)
      .where(
        and(
          colIsNull(timeEntriesTable.stoppedAt),
          colIsNull(timeEntriesTable.deletedAt),
          // Ignore the time entry we are currently updating.
          isDefined(ignoreId) ? ne(timeEntriesTable.id, ignoreId) : undefined,
        ),
      )
      .limit(1)

    check(
      isEmpty(runningTimeEntry),
      () => new TimeEntryMultipleRunningViolation(),
    )
  }

  const day = await tx
    .select()
    .from(daysTable)
    .where(
      and(eq(daysTable.id, timeEntry.dayId), colIsNull(daysTable.deletedAt)),
    )
    .limit(1)
    .then((res) => firstOfOrNull(res.map(toDayDto)))

  check(isNotNull(day), `Day with id "${timeEntry.dayId}" not found.`)

  const timeEntries = await tx
    .select()
    .from(timeEntriesTable)
    .where(
      and(
        eq(timeEntriesTable.dayId, timeEntry.dayId),
        colIsNull(timeEntriesTable.deletedAt),
        // Ignore the time entry we are currently updating.
        isDefined(ignoreId) ? ne(timeEntriesTable.id, ignoreId) : undefined,
      ),
    )
    .orderBy(asc(timeEntriesTable.startedAt))
    .then((res) => res.map(toTimeEntryDto))

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
