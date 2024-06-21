import type { DayService } from '@shared/service/dayService'
import type { DayBase, DayDto } from '@shared/model/day'
import { arrayOfLength } from '@shared/lib/utils/list'
import {
  getOverrideAtIndex,
  type TestDataOverride,
} from '@test/helpers/testDataOverride'
import { randomDate } from '@test/helpers/datetime'
import { PlainDate } from '@shared/lib/datetime/plainDate'

export class DayTestHelpers {
  constructor(private readonly dayService: DayService) {}

  sampleDay(override: Partial<DayBase>) {
    return {
      date: randomDate(),
      targetBillableDuration: null,
      ...override,
    }
  }

  sampleDays(
    amount: number,
    override: Partial<TestDataOverride<DayBase>> = {},
  ): Array<DayBase> {
    return arrayOfLength(amount, (_, index) =>
      this.sampleDay(getOverrideAtIndex(override, index)),
    )
  }

  async createSampleDay(override: Partial<DayBase> = {}): Promise<DayDto> {
    return await this.dayService.createDay(this.sampleDay(override))
  }

  async createSampleDays(
    amount = 6,
    override: Partial<TestDataOverride<DayBase>> = {},
  ): Promise<Array<DayDto>> {
    const sampleDays = this.sampleDays(amount, override)
    return await Promise.all(sampleDays.map(this.dayService.createDay))
  }

  async createDay(date: string | PlainDate): Promise<DayDto> {
    return await this.createSampleDay({ date: PlainDate.from(date) })
  }
}
