import { database } from '@renderer/factory/database/database'
import type { DayService } from '@shared/service/dayService'
import { createDayService } from '@shared/service/dayService'
import { createDayPersistence } from '@shared/persistence/dayPersistence'

export const dayService: DayService = (() => {
  return createDayService({
    dayPersistence: createDayPersistence({
      database,
    }),
  })
})()
