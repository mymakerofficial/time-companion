import { database } from '@renderer/factory/database/database'
import type { TimeEntryService } from '@shared/service/timeEntryService'
import { createTimeEntryService } from '@shared/service/timeEntryService'
import { createTimeEntryPersistence } from '@shared/persistence/timeEntryPersistence'

export const timeEntryService: TimeEntryService = (() => {
  return createTimeEntryService({
    timeEntryPersistence: createTimeEntryPersistence({
      database,
    }),
  })
})()
