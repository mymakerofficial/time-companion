import { Duration } from '@shared/lib/datetime/duration'
import {
  isAbsent,
  isDefined,
  isEmpty,
  isNotNull,
  isNull,
} from '@shared/lib/utils/checks'
import type { Nullable } from '@shared/lib/utils/types'

/**
 * Parses any single human-readable duration input into Duration
 * @param value The input to parse
 * @returns Duration, or null if the duration could not be parsed
 * @example
 * parseHumanTime('1.5h') // 1 hour and 30 minutes
 * parseHumanTime('1:30') // 1 hour and 30 minutes
 * parseHumanTime('130') // 1 hour and 30 minutes
 * parseHumanTime('1 30') // 1 hour and 30 minutes
 * parseHumanTime('90m') // 1 hour and 30 minutes
 * parseHumanTime('1h') // 1 hour and 0 minutes
 */
export function parseHumanDuration(value: string): Nullable<Duration> {
  // match any valid input and extract the relevant parts in groups
  // whole.decimal | hour:minute | value unit
  const inputRegex =
    /^\s*((?<whole>\d{1,2})\.(?<decimal>\d+)?h?\s*$)|((?<hour>\d{1,2})(:|h| )?(?<minute>\d{2})?\s*$)|((?<value>\d+)\s*(?<unit>minute|min|m|hour|h|seconds|second|sec|s)?\s*$)/gi

  const match = inputRegex.exec(value)

  if (isAbsent(match)) {
    return null
  }

  const {
    whole,
    decimal,
    hour,
    minute,
    value: valueString,
    unit,
  } = match.groups!

  if (isDefined(whole)) {
    // value is given as a decimal (e.g. 1.5)
    const hours = parseInt(whole)
    const minutes = (parseInt(decimal) / 10) * 60

    return Duration.from({
      hours,
      minutes,
    })
  }

  if (isDefined(hour)) {
    // value is given in hours and minutes (e.g. 1:30)
    const hours = parseInt(hour)
    const minutes = parseInt(minute) || 0

    return Duration.from({
      hours,
      minutes,
    })
  }

  if (isDefined(valueString)) {
    // value is given in seconds, minutes or hours (e.g. 30s, 90m or 1h)
    switch (unit) {
      case 's':
      case 'sec':
      case 'second':
      case 'seconds':
        return Duration.from({
          seconds: parseInt(valueString),
        })
      case 'm':
      case 'min':
      case 'minute':
      case 'minutes':
        return Duration.from({
          minutes: parseInt(valueString),
        })
      case 'h':
      case 'hour':
        return Duration.from({
          hours: parseInt(valueString),
        })
    }
  }

  return null
}

/**
 * Parses any human-readable time input, including equations, into Duration
 * @param value The input to parse
 * @returns Duration, or null if the duration could not be parsed
 * @example
 * parseHumanTimeWithEquation('08:00 + 30min') // 8 hours 30 minutes
 * parseHumanTimeWithEquation('08:00 - 30min') // 7 hours 30 minutes
 * parseHumanTimeWithEquation('08:00 + 1h + 30min') // 9 hours 30 minutes
 */
export function parseHumanDurationWithEquation(
  value: string,
): Nullable<Duration> {
  // split the input into individual values and operators
  const inputRegex = /(?<operator>[+-])?\s*(?<value>\d+.?\d*\w*)/gi

  const matches = [...value.matchAll(inputRegex)]

  if (isEmpty(matches)) {
    return null
  }

  const values = matches
    .map((match) => {
      const { operator, value: rawValue } = match.groups!

      const duration = parseHumanDuration(rawValue)

      if (isNull(duration)) {
        return null
      }

      switch (operator) {
        case '+':
          return duration
        case '-':
          return duration.negated()
        default:
          return null
      }
    })
    .filter(isNotNull)

  if (isEmpty(values)) {
    return null
  }

  return Duration.sum(values)
}
