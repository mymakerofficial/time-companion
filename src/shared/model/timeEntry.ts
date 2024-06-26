import type { Nullable } from '@shared/lib/utils/types'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { defineTable } from '@database/schema/defineTable'
import { c } from '@database/schema/columnBuilder'
import type { InferTable } from '@database/types/schema'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { z } from 'zod'
import { plainDateTimeType } from '@shared/lib/datetime/schema'
import { isNull } from '@shared/lib/utils/checks'

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

export const timeEntriesTable = defineTable('time_entries', {
  id: c.uuid().primaryKey(),
  dayId: c.uuid().indexed(),
  projectId: c.uuid().nullable().indexed(),
  taskId: c.uuid().nullable(),
  description: c.text(),
  startedAt: c.datetime().indexed(),
  stoppedAt: c.datetime().nullable(), // indexeddb does not support indexing nullable columns
  createdAt: c.datetime(),
  modifiedAt: c.datetime().nullable(),
  deletedAt: c.datetime().nullable(),
})

export type TimeEntryEntity = InferTable<typeof timeEntriesTable>

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
