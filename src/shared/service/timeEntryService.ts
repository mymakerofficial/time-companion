import type { TimeEntryPersistence } from '@shared/persistence/timeEntryPersistence'
import {
  type CreateTimeEntry,
  type TimeEntryDto,
  timeEntrySchema,
  type UpdateTimeEntry,
} from '@shared/model/timeEntry'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { EntityService } from '@shared/service/helpers/entityService'
import { EntityServiceImpl } from '@shared/service/helpers/entityService'
import type { Nullable } from '@shared/lib/utils/types'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'

export type TimeEntryServiceDependencies = {
  timeEntryPersistence: TimeEntryPersistence
}

export interface TimeEntryService extends EntityService<TimeEntryDto> {
  getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>>
  getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>>
  getRunningTimeEntryByDayId(dayId: string): Promise<Nullable<TimeEntryDto>>
  createTimeEntry(timeEntry: Partial<CreateTimeEntry>): Promise<TimeEntryDto>
  patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto>
}

export function createTimeEntryService(
  deps: TimeEntryServiceDependencies,
): TimeEntryService {
  return new TimeEntryServiceImpl(deps)
}

class TimeEntryServiceImpl
  extends EntityServiceImpl<TimeEntryDto>
  implements TimeEntryService
{
  private readonly timeEntryPersistence: TimeEntryPersistence

  constructor(deps: TimeEntryServiceDependencies) {
    super()
    this.timeEntryPersistence = deps.timeEntryPersistence
  }

  getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>> {
    return this.timeEntryPersistence.getTimeEntriesByDayId(dayId)
  }

  getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>> {
    return this.timeEntryPersistence.getTimeEntriesBetween(startedAt, stoppedAt)
  }

  getRunningTimeEntryByDayId(dayId: string): Promise<Nullable<TimeEntryDto>> {
    return this.timeEntryPersistence.getRunningTimeEntryByDayId(dayId)
  }

  async patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    const res = await this.timeEntryPersistence.patchTimeEntry(id, timeEntry)
    this.publishUpdated(res)
    return res
  }

  async createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto> {
    const res = await this.timeEntryPersistence.createTimeEntry({
      ...getSchemaDefaults(timeEntrySchema),
      ...timeEntry,
    })
    this.publishCreated(res)
    return res
  }
}
