import type { Nullable } from '@shared/lib/utils/types'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { z } from 'zod'
import { plainDateTimeType } from '@shared/lib/datetime/schema'
import { isNull } from '@shared/lib/utils/checks'
import { timeEntries } from '@shared/drizzle/schema'

export type TimeEntryBase = {
  dayId: string
  projectId: Nullable<string>
  taskId: Nullable<string>
  description: string
  startedAt: PlainDateTime
  stoppedAt: Nullable<PlainDateTime>
}

export type CreateTimeEntry = TimeEntryBase

export type UpdateTimeEntry = TimeEntryBase

export type TimeEntryDto = TimeEntryBase & BaseDto

export const timeEntriesTable = timeEntries

export type TimeEntryEntity = typeof timeEntriesTable.$inferSelect

export const timeEntrySchema = z.object({
  dayId: z.string(),
  projectId: z.string().nullable().default(null),
  taskId: z.string().nullable().default(null),
  description: z.string().default(''),
  startedAt: plainDateTimeType
    .refine((val) => {
      return val.isBeforeOrEqual(PlainDateTime.now())
    }, 'Started at may not be in the future.')
    .default(() => PlainDateTime.now()),
  stoppedAt: plainDateTimeType
    .nullable()
    .refine((val) => {
      if (isNull(val)) return true
      return val.isBeforeOrEqual(PlainDateTime.now())
    }, 'Stopped at may not be in the future.')
    .default(null),
})
