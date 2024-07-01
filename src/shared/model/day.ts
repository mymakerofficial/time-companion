import type { Nullable } from '@shared/lib/utils/types'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { z } from 'zod'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { Duration } from '@shared/lib/datetime/duration'
import { durationType, plainDateType } from '@shared/lib/datetime/schema'
import { days } from '@shared/drizzle/schema'

export type DayBase = {
  date: PlainDate
  targetBillableDuration: Nullable<Duration>
}

export type CreateDay = DayBase

export type UpdateDay = DayBase

export type DayDto = DayBase & BaseDto

export const daysTable = days

export type DayEntity = typeof daysTable.$inferSelect

export const daySchema = z.object({
  date: plainDateType.default(() => PlainDate.now()),
  targetBillableDuration: durationType
    .nullable()
    .default(Duration.from({ hours: 8 })),
})
