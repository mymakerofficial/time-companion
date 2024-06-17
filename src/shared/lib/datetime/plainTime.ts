import { Temporal } from 'temporal-polyfill'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { PlainDate } from '@shared/lib/datetime/plainDate'

export class PlainTime extends Temporal.PlainTime {
  static from(
    item: PlainTime | Temporal.PlainTime | Temporal.PlainTimeLike | string,
  ): PlainTime {
    return PlainTime.fromTemporalPlainTime(Temporal.PlainTime.from(item))
  }

  static fromTemporalPlainTime(
    temporalPlainTime: Temporal.PlainTime,
  ): PlainTime {
    const fields = temporalPlainTime.getISOFields()

    return new PlainTime(
      fields.isoHour,
      fields.isoMinute,
      fields.isoSecond,
      fields.isoMillisecond,
      fields.isoMicrosecond,
      fields.isoNanosecond,
    )
  }

  add(duration: Temporal.Duration): PlainTime {
    return PlainTime.fromTemporalPlainTime(super.add(duration))
  }

  toPlainDateTime(
    temporalDate:
      | PlainDate
      | PlainDateTime
      | Temporal.PlainDate
      | Temporal.PlainDateLike
      | string,
  ): PlainDateTime {
    return PlainDateTime.fromTemporalPlainDateTime(
      super.toPlainDateTime(temporalDate),
    )
  }
}
