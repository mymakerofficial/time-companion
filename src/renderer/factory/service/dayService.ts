import { database } from '@renderer/factory/database/database'
import { isDefined } from '@shared/lib/utils/checks'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import type {
  EntityPublisherEvent,
  EntityPublisherTopics,
} from '@shared/events/entityPublisher'
import type { DayDto } from '@shared/model/day'
import type { DayService } from '@shared/service/dayService'
import { createDayService } from '@shared/service/dayService'
import { createDayPersistence } from '@shared/persistence/dayPersistence'

export const dayService: DayService = (() => {
  if (isDefined(window.electronAPI)) {
    return createPublisherServiceProxy<
      DayService,
      EntityPublisherTopics,
      EntityPublisherEvent<DayDto>
    >(window.electronAPI.service.day)
  }

  return createDayService({
    dayPersistence: createDayPersistence({
      database,
    }),
  })
})()
