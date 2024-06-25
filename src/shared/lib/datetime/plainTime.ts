import { Temporal } from 'temporal-polyfill'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { Duration } from '@shared/lib/datetime/duration'

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

  static now(): PlainTime {
    return PlainTime.fromTemporalPlainTime(Temporal.Now.plainTimeISO())
  }

  add(
    durationLike: Duration | Temporal.Duration | Temporal.DurationLike | string,
    options?: Temporal.ArithmeticOptions,
  ): PlainTime {
    return PlainTime.fromTemporalPlainTime(super.add(durationLike))
  }

  subtract(
    durationLike: Duration | Temporal.Duration | Temporal.DurationLike | string,
    options?: Temporal.ArithmeticOptions,
  ): PlainTime {
    return PlainTime.fromTemporalPlainTime(super.subtract(durationLike))
  }

  until(
    other: PlainTime | Temporal.PlainTime | Temporal.PlainTimeLike | string,
    options?: Temporal.DifferenceOptions<
      | 'hour'
      | 'minute'
      | 'second'
      | 'millisecond'
      | 'microsecond'
      | 'nanosecond'
    >,
  ): Duration {
    return Duration.fromTemporalDuration(super.until(other, options))
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

  toDurationSince(
    other: PlainTime | Temporal.PlainTime | Temporal.PlainTimeLike | string,
  ): Duration {
    return Duration.fromTemporalDuration(super.since(other))
  }

  toDurationUntil(
    other: PlainTime | Temporal.PlainTime | Temporal.PlainTimeLike | string,
  ): Duration {
    return Duration.fromTemporalDuration(super.until(other))
  }

  toDuration(): Duration {
    return this.toDurationSince({ hour: 0, minute: 0, second: 0 })
  }
}
