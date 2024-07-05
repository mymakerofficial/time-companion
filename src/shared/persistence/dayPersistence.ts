import { type CreateDay, type DayDto, daysTable } from '@shared/model/day'
import { toDayDto } from '@shared/model/mappers/day'
import { check, isNotEmpty } from '@shared/lib/utils/checks'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import type { Database } from '@shared/drizzle/database'
import { and, eq, isNull } from 'drizzle-orm'
import { firstOf } from '@shared/lib/utils/list'
import { handleSqliteError } from '@shared/drizzle/error'

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
    const res = await this.database
      .select()
      .from(daysTable)
      .where(isNull(daysTable.deletedAt))
      .catch(handleSqliteError)

    return res.map(toDayDto)
  }

  async getDayById(id: string): Promise<DayDto> {
    const res = await this.database
      .select()
      .from(daysTable)
      .where(and(eq(daysTable.id, id), isNull(daysTable.deletedAt)))
      .limit(1)
      .catch(handleSqliteError)

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
      .catch(handleSqliteError)

    check(isNotEmpty(res), `Day with date "${date}" not found.`)
    return toDayDto(firstOf(res))
  }

  async createDay(day: CreateDay): Promise<DayDto> {
    const res = await this.database
      .insert(daysTable)
      .values({
        date: day.date.toDate(),
        targetBillableDuration:
          day.targetBillableDuration?.total('milliseconds') ?? null,
      })
      .returning()
      .catch(handleSqliteError)

    return toDayDto(firstOf(res))
  }
}
