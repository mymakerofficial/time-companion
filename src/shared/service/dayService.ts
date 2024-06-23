import type { DayPersistence } from '@shared/persistence/dayPersistence'
import { type CreateDay, type DayDto, daySchema } from '@shared/model/day'
import type { EntityService } from '@shared/service/helpers/entityService'
import { EntityServiceImpl } from '@shared/service/helpers/entityService'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import { asyncGetOrElse } from '@shared/lib/utils/result'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'

export type DayServiceDependencies = {
  dayPersistence: DayPersistence
}

export interface DayService extends EntityService<DayDto> {
  getDays(): Promise<Array<DayDto>>
  getDayById(id: string): Promise<DayDto>
  getDayByDate(date: PlainDate): Promise<DayDto>
  getOrCreateDayByDate(date: PlainDate): Promise<DayDto>
  createDay(day: Partial<CreateDay>): Promise<DayDto>
}

export function createDayService(deps: DayServiceDependencies): DayService {
  return new DayServiceImpl(deps)
}

export class DayServiceImpl
  extends EntityServiceImpl<DayDto>
  implements DayService
{
  private readonly dayPersistence: DayPersistence

  constructor(deps: DayServiceDependencies) {
    super()
    this.dayPersistence = deps.dayPersistence
  }

  async getDays(): Promise<Array<DayDto>> {
    return await this.dayPersistence.getDays()
  }

  async getDayById(id: string): Promise<DayDto> {
    return await this.dayPersistence.getDayById(id)
  }

  async getDayByDate(date: PlainDate): Promise<DayDto> {
    return await this.dayPersistence.getDayByDate(date)
  }

  async getOrCreateDayByDate(date: PlainDate): Promise<DayDto> {
    return await asyncGetOrElse(
      () => this.dayPersistence.getDayByDate(date),
      () => this.createDay({ date }),
    )
  }

  async createDay(day: Partial<CreateDay>): Promise<DayDto> {
    return await this.dayPersistence.createDay({
      ...getSchemaDefaults(daySchema),
      ...day,
    })
  }
}
