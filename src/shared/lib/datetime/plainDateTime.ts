import { Temporal } from 'temporal-polyfill'
import { isDate } from '@shared/lib/utils/checks'
import type { Duration } from '@shared/lib/datetime/duration'

export class PlainDateTime extends Temporal.PlainDateTime {
  static from(
    item: Date | Temporal.PlainDateTime | Temporal.PlainDateTimeLike | string,
    options?: Temporal.AssignmentOptions,
  ): PlainDateTime {
    if (isDate(item)) {
      return PlainDateTime.from({
        year: item.getFullYear(),
        month: item.getMonth() + 1,
        day: item.getDate(),
        hour: item.getHours(),
        minute: item.getMinutes(),
        second: item.getSeconds(),
        millisecond: item.getMilliseconds(),
      })
    }

    return PlainDateTime.fromTemporalPlainDateTime(
      Temporal.PlainDateTime.from(item, options),
    )
  }

  static fromTemporalPlainDateTime(
    temporalPlainDateTime: Temporal.PlainDateTime,
  ): PlainDateTime {
    const fields = temporalPlainDateTime.getISOFields()

    return new PlainDateTime(
      fields.isoYear,
      fields.isoMonth,
      fields.isoDay,
      fields.isoHour,
      fields.isoMinute,
      fields.isoSecond,
      fields.isoMillisecond,
      fields.isoMicrosecond,
      fields.isoNanosecond,
      fields.calendar,
    )
  }

  static now(): PlainDateTime {
    return PlainDateTime.fromTemporalPlainDateTime(
      Temporal.Now.plainDateTimeISO(),
    )
  }

  toDate(): Date {
    return new Date(
      this.year,
      this.month - 1,
      this.day,
      this.hour,
      this.minute,
      this.second,
      this.millisecond,
    )
  }

  add(
    durationLike: Duration | Temporal.Duration | Temporal.DurationLike | string,
    options?: Temporal.ArithmeticOptions,
  ): PlainDateTime {
    return PlainDateTime.fromTemporalPlainDateTime(
      super.add(durationLike, options),
    )
  }

  isBefore(other: PlainDateTime): boolean {
    return PlainDateTime.compare(this, other) === -1
  }

  isAfter(other: PlainDateTime): boolean {
    return PlainDateTime.compare(this, other) === 1
  }
}
