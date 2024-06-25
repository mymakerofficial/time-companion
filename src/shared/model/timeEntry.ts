import type { Nullable } from '@shared/lib/utils/types'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { defineTable } from '@database/schema/defineTable'
import { c } from '@database/schema/columnBuilder'
import type { InferTable } from '@database/types/schema'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { z } from 'zod'
import { plainDateTimeType } from '@shared/lib/datetime/schema'

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
  description: z.string().min(1).default(''),
  startedAt: plainDateTimeType.default(() => PlainDateTime.now()),
  stoppedAt: plainDateTimeType.nullable().default(null),
})
