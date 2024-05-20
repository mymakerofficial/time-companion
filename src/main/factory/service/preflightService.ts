import { database } from '@main/factory/database/database'
import {
  createPreflightService,
  type PreflightService,
} from '@shared/service/preflightService'

export const preflightService: PreflightService = (() => {
  return createPreflightService({
    database,
  })
})()
