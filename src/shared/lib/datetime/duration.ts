import { Temporal } from 'temporal-polyfill'

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

  isShorterThan(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): boolean {
    return Duration.compare(this, Duration.from(other)) === -1
  }

  isLongerThan(
    other: Duration | Temporal.Duration | Temporal.DurationLike | string,
  ): boolean {
    return Duration.compare(this, Duration.from(other)) === 1
  }
}
