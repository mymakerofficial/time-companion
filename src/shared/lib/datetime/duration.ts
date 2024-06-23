import { Temporal } from 'temporal-polyfill'
import { PlainTime } from '@shared/lib/datetime/plainTime'

export class Duration extends Temporal.Duration {
  static from(
    item: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): Duration {
    return Duration.fromTemporalDuration(Temporal.Duration.from(item))
  }

  static fromTemporalDuration(temporalDuration: Temporal.Duration): Duration {
    return new Duration(
      temporalDuration.years,
      temporalDuration.months,
      temporalDuration.weeks,
      temporalDuration.days,
      temporalDuration.hours,
      temporalDuration.minutes,
      temporalDuration.seconds,
      temporalDuration.milliseconds,
      temporalDuration.microseconds,
      temporalDuration.nanoseconds,
    )
  }

  static zero(): Duration {
    return new Duration()
  }

  static sum(durations: Duration[]): Duration {
    return durations.reduce(
      (acc, duration) => acc.add(duration),
      Duration.zero(),
    )
  }

  toPlainTime(): PlainTime {
    return PlainTime.from({
      hour: this.total({ unit: 'hours' }),
      minute: this.total({ unit: 'minutes' }) % 60,
      second: this.total({ unit: 'seconds' }) % 60,
      millisecond: this.total({ unit: 'milliseconds' }) % 1000,
      microsecond: this.total({ unit: 'microseconds' }) % 1000,
      nanosecond: this.total({ unit: 'nanoseconds' }) % 1000,
    })
  }

  add(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): Duration {
    return Duration.fromTemporalDuration(super.add(Duration.from(other)))
  }

  subtract(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): Duration {
    return Duration.fromTemporalDuration(super.subtract(Duration.from(other)))
  }

  abs(): Duration {
    return Duration.fromTemporalDuration(super.abs())
  }

  negated(): Duration {
    return Duration.fromTemporalDuration(super.negated())
  }

  isShorterThan(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): boolean {
    return Duration.compare(this, Duration.from(other)) === -1
  }

  isShorterThanOrEqual(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): boolean {
    return Duration.compare(this, Duration.from(other)) !== 1
  }

  isLongerThan(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): boolean {
    return Duration.compare(this, Duration.from(other)) === 1
  }

  isLongerThanOrEqual(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): boolean {
    return Duration.compare(this, Duration.from(other)) !== -1
  }

  isEqualTo(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): boolean {
    return Duration.compare(this, Duration.from(other)) === 0
  }
}
