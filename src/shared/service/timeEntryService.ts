import type { TimeEntryPersistence } from '@shared/persistence/timeEntryPersistence'
import {
  type CreateTimeEntry,
  type TimeEntryDto,
  timeEntrySchema,
  type UpdateTimeEntry,
} from '@shared/model/timeEntry'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { EntityService } from '@shared/service/helpers/entityService'
import { EntityServiceImpl } from '@shared/service/helpers/entityService'
import type { Nullable } from '@shared/lib/utils/types'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'
import { Duration } from '@shared/lib/datetime/duration'
import { runZod } from '@shared/lib/helpers/zod'

const ONE_MONTH = Duration.from({ months: 1 })

export type TimeEntryServiceDependencies = {
  timeEntryPersistence: TimeEntryPersistence
}

export interface TimeEntryService extends EntityService<TimeEntryDto> {
  getTimeEntryById(id: string): Promise<Nullable<TimeEntryDto>>
  getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>>
  getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>>
  getRunningTimeEntry(): Promise<Nullable<TimeEntryDto>>
  createTimeEntry(timeEntry: Partial<CreateTimeEntry>): Promise<TimeEntryDto>
  patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto>
  softDeleteTimeEntry(id: string): Promise<void>
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

  getTimeEntryById(id: string): Promise<Nullable<TimeEntryDto>> {
    return this.timeEntryPersistence.getTimeEntryById(id)
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

  getRunningTimeEntry(): Promise<Nullable<TimeEntryDto>> {
    const upperBound = PlainDateTime.now()
    const lowerBound = upperBound.subtract(ONE_MONTH)
    return this.timeEntryPersistence.getRunningTimeEntry(lowerBound, upperBound)
  }

  async patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    runZod(() => timeEntrySchema.partial().parse(timeEntry))
    const res = await this.timeEntryPersistence.patchTimeEntry(id, timeEntry)
    this.publishUpdated(res)
    return res
  }

  async createTimeEntry(
    timeEntry: Partial<CreateTimeEntry>,
  ): Promise<TimeEntryDto> {
    runZod(() => timeEntrySchema.partial().parse(timeEntry))
    const res = await this.timeEntryPersistence.createTimeEntry({
      ...getSchemaDefaults(timeEntrySchema),
      ...timeEntry,
    })
    this.publishCreated(res)
    return res
  }

  async softDeleteTimeEntry(id: string): Promise<void> {
    await this.timeEntryPersistence.softDeleteTimeEntry(id)
    this.publishDeleted(id)
  }
}
