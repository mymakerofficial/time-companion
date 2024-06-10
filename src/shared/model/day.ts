import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import type { Nullable } from '@shared/lib/utils/types'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import type { InferTable } from '@shared/database/types/schema'
import { z } from 'zod'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { Duration } from '@shared/lib/datetime/duration'

export type DayBase = {
  date: PlainDate
  targetBillableDuration: Nullable<Duration>
}

export type CreateDay = DayBase

export type UpdateDay = DayBase

export type DayDto = DayBase & BaseDto

export const daysTable = defineTable('days', {
  id: c.uuid().primaryKey(),
  date: c.date().indexed().unique(),
  targetBillableDuration: c.interval().nullable(),
  createdAt: c.datetime(),
  modifiedAt: c.datetime().nullable(),
  deletedAt: c.datetime().nullable(),
})

export type DayEntity = InferTable<typeof daysTable>

export const daySchema = z.object({
  date: z.custom<PlainDate>(),
  targetBillableDuration: z
    .custom<Duration>()
    .nullable()
    .default(Duration.from('PT8H')),
})
