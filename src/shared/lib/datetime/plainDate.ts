import { Temporal } from 'temporal-polyfill'
import { isDate } from '@shared/lib/utils/checks'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { PlainTime } from '@shared/lib/datetime/plainTime'
import type { Duration } from '@shared/lib/datetime/duration'

export class PlainDate extends Temporal.PlainDate {
  static from(
    item: Date | Temporal.PlainDate | Temporal.PlainDateLike | string,
    options?: Temporal.AssignmentOptions,
  ): PlainDate {
    if (isDate(item)) {
      return PlainDate.from({
        year: item.getFullYear(),
        month: item.getMonth() + 1,
        day: item.getDate(),
      })
    }

    return PlainDate.fromTemporalPlainDate(
      Temporal.PlainDate.from(item, options),
    )
  }

  static fromTemporalPlainDate(
    temporalPlainDate: Temporal.PlainDate,
  ): PlainDate {
    const fields = temporalPlainDate.getISOFields()

    return new PlainDate(
      fields.isoYear,
      fields.isoMonth,
      fields.isoDay,
      fields.calendar,
    )
  }

  static now(): PlainDate {
    return PlainDate.fromTemporalPlainDate(Temporal.Now.plainDateISO())
  }

  toDate(): Date {
    return new Date(this.year, this.month - 1, this.day)
  }

  toPlainDateTime(
    temporalTime:
      | PlainTime
      | Temporal.PlainTime
      | Temporal.PlainTimeLike
      | string = { hour: 0, minute: 0, second: 0 },
  ): PlainDateTime {
    return PlainDateTime.fromTemporalPlainDateTime(
      super.toPlainDateTime(temporalTime),
    )
  }

  add(
    durationLike: Duration | Temporal.Duration | Temporal.DurationLike | string,
    options?: Temporal.ArithmeticOptions,
  ): PlainDate {
    return PlainDate.fromTemporalPlainDate(super.add(durationLike, options))
  }

  subtract(
    durationLike: Duration | Temporal.Duration | Temporal.DurationLike | string,
    options?: Temporal.ArithmeticOptions,
  ): PlainDate {
    return PlainDate.fromTemporalPlainDate(
      super.subtract(durationLike, options),
    )
  }
}
