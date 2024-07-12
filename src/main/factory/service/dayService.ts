import { database } from '@renderer/factory/database/database'
import type { DayService } from '@shared/business/day/dayService'
import { createDayService } from '@shared/business/day/dayService'
import { createDayPersistence } from '@shared/business/day/dayPersistence'

export const dayService: DayService = (() => {
  return createDayService({
    dayPersistence: createDayPersistence({
      database,
    }),
  })
})()
