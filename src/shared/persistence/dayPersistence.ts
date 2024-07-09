import { type CreateDay, type DayDto, daysTable } from '@shared/model/day'
import { check, isNotNull } from '@shared/lib/utils/checks'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import type { Database } from '@shared/drizzle/database'
import { and, eq, isNull } from 'drizzle-orm'
import { firstOf, firstOfOrNull } from '@shared/lib/utils/list'
import { handleSqliteError } from '@shared/drizzle/lib/error'

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

  async getDays(): Promise<Array<DayDto>> {
    return await this.database
      .select()
      .from(daysTable)
      .where(isNull(daysTable.deletedAt))
      .catch(handleSqliteError)
  }

  async getDayById(id: string): Promise<DayDto> {
    const res = await this.database
      .select()
      .from(daysTable)
      .where(and(eq(daysTable.id, id), isNull(daysTable.deletedAt)))
      .limit(1)
      .catch(handleSqliteError)
      .then(firstOfOrNull)

    check(isNotNull(res), `Day with id "${id}" not found.`)

    return res
  }

  async getDayByDate(date: PlainDate): Promise<DayDto> {
    const res = await this.database
      .select()
      .from(daysTable)
      .where(and(eq(daysTable.date, date), isNull(daysTable.deletedAt)))
      .limit(1)
      .catch(handleSqliteError)
      .then(firstOfOrNull)

    check(isNotNull(res), `Day with date "${date}" not found.`)

    return res
  }

  async createDay(day: CreateDay): Promise<DayDto> {
    return await this.database
      .insert(daysTable)
      .values(day)
      .returning()
      .catch(handleSqliteError)
      .then(firstOf)
  }
}
