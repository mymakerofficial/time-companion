import { database } from '@renderer/factory/database/database'
import { isDefined } from '@shared/lib/utils/checks'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import type {
  EntityPublisherEvent,
  EntityPublisherTopics,
} from '@shared/events/entityPublisher'
import type { TimeEntryService } from '@shared/business/timeEntry/timeEntryService'
import { createTimeEntryService } from '@shared/business/timeEntry/timeEntryService'
import type { TimeEntryDto } from '@shared/model/timeEntry'
import { createTimeEntryPersistence } from '@shared/business/timeEntry/timeEntryPersistence'

export const timeEntryService: TimeEntryService = (() => {
  if (isDefined(window.electronAPI)) {
    return createPublisherServiceProxy<
      TimeEntryService,
      EntityPublisherTopics,
      EntityPublisherEvent<TimeEntryDto>
    >(window.electronAPI.service.timeEntry)
  }

  return createTimeEntryService({
    timeEntryPersistence: createTimeEntryPersistence({
      database,
    }),
  })
})()
