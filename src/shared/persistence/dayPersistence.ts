import type { Database } from '@shared/database/types/database'
import { type CreateDay, type DayDto, daysTable } from '@shared/model/day'
import { uuid } from '@shared/lib/utils/uuid'
import { toDayDto } from '@shared/model/mappers/day'
import { check, isNotNull } from '@shared/lib/utils/checks'
import {
  type DatabaseError,
  errorIsUndefinedColumn,
  errorIsUniqueViolation,
} from '@shared/database/types/errors'

export type DayPersistenceDependencies = {
  database: Database
}

export interface DayPersistence {
  getDays(): Promise<Array<DayDto>>
  getDayById(id: string): Promise<DayDto>
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
    return await this.database
      .table(daysTable)
      .findMany({
        where: daysTable.deletedAt.isNull(),
        map: toDayDto,
      })
      .catch(this.resolveError)
  }

  async getDayById(id: string): Promise<DayDto> {
    return await this.database
      .table(daysTable)
      .findFirst({
        range: daysTable.id.range.only(id),
        where: daysTable.deletedAt.isNull(),
        map: toDayDto,
      })
      .catch(this.resolveError)
      .then((res) => {
        check(isNotNull(res), `Day with id "${id}" not found.`)
        return res
      })
  }

  async createDay(day: CreateDay): Promise<DayDto> {
    return await this.database
      .table(daysTable)
      .insert({
        data: {
          id: uuid(),
          date: day.date.toDate(),
          targetBillableDuration:
            day.targetBillableDuration?.toString() ?? null,
          createdAt: new Date(),
          modifiedAt: null,
          deletedAt: null,
        },
        map: toDayDto,
      })
      .catch(this.resolveError)
  }
}