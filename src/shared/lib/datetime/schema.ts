import { z } from 'zod'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { Duration } from '@shared/lib/datetime/duration'
import type { PlainTime } from '@shared/lib/datetime/plainTime'
import type { PlainDate } from '@shared/lib/datetime/plainDate'

export const plainDateTimeType = z.custom<PlainDateTime>((_value) => {
  return true // TODO: Implement validation
})

export const plainDateType = z.custom<PlainDate>((_value) => {
  return true // TODO: Implement validation
})

export const plainTimeType = z.custom<PlainTime>((_value) => {
  return true // TODO: Implement validation
})

export const durationType = z.custom<Duration>((_value) => {
  return true // TODO: Implement validation
})
