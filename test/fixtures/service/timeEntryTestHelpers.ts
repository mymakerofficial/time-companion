import { arrayOfLength } from '@shared/lib/utils/list'
import {
  getOverrideAtIndex,
  type TestDataOverride,
} from '@test/helpers/testDataOverride'
import { randomDateTime } from '@test/helpers/datetime'
import type { TimeEntryService } from '@shared/service/timeEntryService'
import type { TimeEntryBase, TimeEntryDto } from '@shared/model/timeEntry'
import { uuid } from '@shared/lib/utils/uuid'
import { faker } from '@faker-js/faker'
import { isSometimesNullOr } from '@test/helpers/maybe'

export class TimeEntryTestHelpers {
  constructor(private readonly timeEntryService: TimeEntryService) {}

  sampleTimeEntry(override: Partial<TimeEntryBase>): TimeEntryBase {
    return {
      dayId: uuid(),
      projectId: null,
      taskId: null,
      description: faker.lorem.sentence(),
      startedAt: randomDateTime(),
      stoppedAt: isSometimesNullOr(randomDateTime()),
      ...override,
    }
  }

  sampleTimeEntries(
    amount: number,
    override: Partial<TestDataOverride<TimeEntryBase>> = {},
  ): Array<TimeEntryBase> {
    return arrayOfLength(amount, (_, index) =>
      this.sampleTimeEntry(getOverrideAtIndex(override, index)),
    )
  }

  async createSampleTimeEntry(
    override: Partial<TimeEntryBase> = {},
  ): Promise<TimeEntryDto> {
    return await this.timeEntryService.createTimeEntry(
      this.sampleTimeEntry(override),
    )
  }

  async createSampleTimeEntries(
    amount = 6,
    override: Partial<TestDataOverride<TimeEntryBase>> = {},
  ): Promise<Array<TimeEntryDto>> {
    const sampleDays = this.sampleTimeEntries(amount, override)
    return await Promise.all(
      sampleDays.map(this.timeEntryService.createTimeEntry),
    )
  }
}