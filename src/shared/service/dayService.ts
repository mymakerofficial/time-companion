import type { DayPersistence } from '@shared/persistence/dayPersistence'
import type { CreateDay, DayDto } from '@shared/model/day'

export type DayServiceDependencies = {
  dayPersistence: DayPersistence
}

export interface DayService {
  getDays(): Promise<Array<DayDto>>
  getDayById(id: string): Promise<DayDto>
  createDay(day: CreateDay): Promise<DayDto>
}

export function createDayService(deps: DayServiceDependencies): DayService {
  return new DayServiceImpl(deps)
}

export class DayServiceImpl implements DayService {
  private readonly dayPersistence: DayPersistence

  constructor(deps: DayServiceDependencies) {
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
