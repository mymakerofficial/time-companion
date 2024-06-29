import { type CreateDay, type DayDto, daysTable } from '@shared/model/day'
import { uuid } from '@shared/lib/utils/uuid'
import { toDayDto } from '@shared/model/mappers/day'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@database/types/errors'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import type { Database } from '@shared/drizzle/database'
import { and, eq, isNull } from 'drizzle-orm'
import { firstOf } from '@shared/lib/utils/list'

export type DayPersistenceDependencies = {
  database: Database
}

export interface DayPersistence {
  getDays(): Promise<Array<DayDto>>
  getDayById(id: string): Promise<DayDto>
  getDayByDate(date: PlainDate): Promise<DayDto>
  createDay(day: CreateDay): Promise<DayDto>
}

export function createDayPersistence(
  deps: DayPersistenceDependencies,
): DayPersistence {
  return new DayPersistenceImpl(deps)
}

class DayPersistenceImpl implements DayPersistence {
  private readonly database: Database

  constructor(deps: DayPersistenceDependencies) {
    this.database = deps.database
  }

  protected resolveError(error: DatabaseError): never {
    if (errorIsUniqueViolation(error)) {
      throw new Error(
        `Day with ${error.columnName} "${error.value}" already exists.`,
      )
    }

    if (errorIsUndefinedColumn(error)) {
      throw new Error(
        `Tried to set value for undefined field "${error.columnName}" on day.`,
      )
    }

    throw error
  }

  async getDays(): Promise<Array<DayDto>> {
    const res = await this.database
      .select()
      .from(daysTable)
      .where(isNull(daysTable.deletedAt))
    return res.map(toDayDto)
  }

  async getDayById(id: string): Promise<DayDto> {
    const res = await this.database
      .select()
      .from(daysTable)
      .where(and(eq(daysTable.id, id), isNull(daysTable.deletedAt)))
      .limit(1)
    check(isNotEmpty(res), `Day with id "${id}" not found.`)
    return toDayDto(firstOf(res))
  }

  async getDayByDate(date: PlainDate): Promise<DayDto> {
    const res = await this.database
      .select()
      .from(daysTable)
      .where(
        and(eq(daysTable.date, date.toDate()), isNull(daysTable.deletedAt)),
      )
      .limit(1)
    check(isNotEmpty(res), `Day with date "${date}" not found.`)
    return toDayDto(firstOf(res))
  }

  async createDay(day: CreateDay): Promise<DayDto> {
    const res = await this.database
      .insert(daysTable)
      .values({
        id: uuid(),
        date: day.date.toDate(),
        targetBillableDuration: day.targetBillableDuration?.toString() ?? null,
      })
      .returning()
    return toDayDto(firstOf(res))
  }
}
