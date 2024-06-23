import type { DayPersistence } from '@shared/persistence/dayPersistence'
import type { CreateDay, DayDto } from '@shared/model/day'
import type { EntityService } from '@shared/service/helpers/entityService'
import { EntityServiceImpl } from '@shared/service/helpers/entityService'

export type DayServiceDependencies = {
  dayPersistence: DayPersistence
}

export interface DayService extends EntityService<DayDto> {
  getDays(): Promise<Array<DayDto>>
  getDayById(id: string): Promise<DayDto>
  createDay(day: CreateDay): Promise<DayDto>
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

  async createDay(day: CreateDay): Promise<DayDto> {
    return await this.dayPersistence.createDay(day)
  }
}
