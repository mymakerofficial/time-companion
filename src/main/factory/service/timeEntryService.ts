import { database } from '@renderer/factory/database/database'
import type { TimeEntryService } from '@shared/business/timeEntry/timeEntryService'
import { createTimeEntryService } from '@shared/business/timeEntry/timeEntryService'
import { createTimeEntryPersistence } from '@shared/business/timeEntry/timeEntryPersistence'

export const timeEntryService: TimeEntryService = (() => {
  return createTimeEntryService({
    timeEntryPersistence: createTimeEntryPersistence({
      database,
    }),
  })
})()
