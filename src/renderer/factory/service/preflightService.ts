import { isDefined } from '@shared/lib/utils/checks'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import { database } from '@renderer/factory/database/database'
import type {
  PreflightPublisherEvent,
  PreflightPublisherTopics,
  PreflightService,
} from '@shared/service/preflightService'
import { createPreflightService } from '@shared/service/preflightService'

export const preflightService: PreflightService = (() => {
  if (isDefined(window.electronAPI)) {
    return createPublisherServiceProxy<
      PreflightService,
      PreflightPublisherTopics,
      PreflightPublisherEvent
    >(window.electronAPI.service.preflight)
  }

  return createPreflightService({
    database,
  })
})()
