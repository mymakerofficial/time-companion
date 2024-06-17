import type { TimeEntryPersistence } from '@shared/persistence/timeEntryPersistence'
import type {
  CreateTimeEntry,
  TimeEntryDto,
  UpdateTimeEntry,
} from '@shared/model/timeEntry'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { EntityService } from '@shared/service/helpers/entityService'
import { EntityServiceImpl } from '@shared/service/helpers/entityService'

export type TimeEntryServiceDependencies = {
  timeEntryPersistence: TimeEntryPersistence
}

export interface TimeEntryService extends EntityService<TimeEntryDto> {
  getTimeEntriesByDayId(dayId: string): Promise<Array<TimeEntryDto>>
  getTimeEntriesBetween(
    startedAt: PlainDateTime,
    stoppedAt: PlainDateTime,
  ): Promise<Array<TimeEntryDto>>
  createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto>
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

  patchTimeEntry(
    id: string,
    timeEntry: Partial<UpdateTimeEntry>,
  ): Promise<TimeEntryDto> {
    return this.timeEntryPersistence.patchTimeEntry(id, timeEntry)
  }

  createTimeEntry(timeEntry: CreateTimeEntry): Promise<TimeEntryDto> {
    return this.timeEntryPersistence.createTimeEntry(timeEntry)
  }
}
