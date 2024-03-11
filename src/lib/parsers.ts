import {isNotDefined, isNotNull, isNull, type Nullable} from "@/lib/utils";
import {isEmpty} from "@/lib/listUtils";
import {Temporal} from "temporal-polyfill";
import {durationZero, negateDuration, sumOfDurations, timeZero} from "@/lib/neoTime";

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
export function parseHumanDuration(value: string): Nullable<Temporal.Duration> {
  // match any valid input and extract the relevant parts in groups
  // whole.decimal | hour:minute | value unit
  const inputRegex = /^\s*((?<whole>\d{1,2})\.(?<decimal>\d+)?h?\s*$)|((?<hour>\d{1,2})(:|h| )?(?<minute>\d{2})?\s*$)|((?<value>\d+)\s*(?<unit>minute|min|m|hour|h|seconds|second|sec|s)?\s*$)/gi

  const match = inputRegex.exec(value)

  if (isNotDefined(match)) {
    return null
  }

  const {
    whole,
    decimal,
    hour,
    minute,
    value: valueString,
    unit
  } = match.groups!

  if (whole !== undefined) {
    // value is given as a decimal (e.g. 1.5)
    const hours = parseInt(whole)
    const minutes = parseInt(decimal) / 10 * 60

    return Temporal.Duration.from({
      hours,
      minutes
    })
  }

  if (hour !== undefined) {
    // value is given in hours and minutes (e.g. 1:30)
    const hours = parseInt(hour)
    const minutes = parseInt(minute) || 0

    return Temporal.Duration.from({
      hours,
      minutes
    })
  }

  if (valueString !== undefined) {
    // value is given in seconds,  minutes or hours (e.g. 30s, 90m or 1h)

    const isMinutes = unit === 'm' || unit === 'min' || unit === 'minute' || unit === 'minutes'
    const isSeconds = unit === 's' || unit === 'sec' || unit === 'second' || unit === 'seconds'

    const multiplier = isSeconds ? 1 : isMinutes ? 60 : 3600

    return durationZero().add({
      seconds: parseInt(valueString) * multiplier,
    })
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
export function parseHumanDurationWithEquation(value: string): Nullable<Temporal.Duration> {
  // split the input into individual values and operators
  const inputRegex = /(?<operator>[+-])?\s*(?<value>\d+.?\d*\w*)/gi

  const matches = [...value.matchAll(inputRegex)]

  if (isEmpty(matches)) {
    return null
  }

  const values = matches.map((match) => {
    const {operator, value: rawValue} = match.groups!

    const isNegative = operator === '-'
    const duration = parseHumanDuration(rawValue)

    if (isNull(duration)) {
      return null
    }

    if (isNegative) {
      return negateDuration(duration)
    } else {
      return duration
    }
  }).filter(isNotNull)

  if (isEmpty(values)) {
    return null
  }

  return sumOfDurations(values)
}