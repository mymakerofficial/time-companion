import type { DayDto, DayEntity } from '@shared/model/day'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { Duration } from '@shared/lib/datetime/duration'

export function toDayDto(day: DayEntity): DayDto {
  return {
    id: day.id,
    date: PlainDate.from(day.date),
    targetBillableDuration: day.targetBillableDuration
      ? Duration.from(day.targetBillableDuration)
      : null,
    createdAt: PlainDateTime.from(day.createdAt),
    modifiedAt: day.modifiedAt ? PlainDateTime.from(day.modifiedAt) : null,
    deletedAt: day.deletedAt ? PlainDateTime.from(day.deletedAt) : null,
  }
}
