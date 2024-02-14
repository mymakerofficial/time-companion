import {isNotDefined, type Nullable} from "@/lib/utils";
import {isEmpty} from "@/lib/listUtils";
import {LocalTime} from "@js-joda/core";

/**
 * Parses any single human-readable time input into LocalTime
 * @param value The input to parse
 * @returns LocalTime, or null if the duration could not be parsed
 * @example
 * parseHumanTime('1.5h') // LocalTime.of(1, 30)
 * parseHumanTime('1:30') // LocalTime.of(1, 30)
 * parseHumanTime('130') // LocalTime.of(1, 30)
 * parseHumanTime('1 30') // LocalTime.of(1, 30)
 * parseHumanTime('90m') // LocalTime.of(1, 30)
 * parseHumanTime('1h') // LocalTime.of(1, 0)
 */
export function parseHumanTime(value: string): Nullable<LocalTime> {
  // match any valid input and extract the relevant parts in groups
  // whole.decimal | hour:minute | value unit
  const inputRegex = /^\s*((?<whole>\d{1,2})\.(?<decimal>\d+)?h?\s*$)|((?<hour>\d{1,2})(:|h| )?(?<minute>\d{2})?\s*$)|((?<value>\d+)\s*(?<unit>minute|min|m|hour|h)?\s*$)/gi

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
    return LocalTime.of(hours, minutes)
  }

  if (hour !== undefined) {
    // value is given in hours and minutes (e.g. 1:30)
    const hours = parseInt(hour)
    const minutes = parseInt(minute) || 0
    return LocalTime.of(hours, minutes)
  }

  if (valueString !== undefined) {
    // value is given in minutes or hours (e.g. 90m or 1h)
    const isMinutes = unit === 'm' || unit === 'min' || unit === 'minute'
    return LocalTime.of(0).plusMinutes(parseInt(valueString) * (isMinutes ? 1 : 60))
  }

  return null
}

/**
 * Parses any human-readable time input, including equations, into LocalTime
 * @param value The input to parse
 * @returns LocalTime, or null if the duration could not be parsed
 * @example
 * parseHumanTimeWithEquation('08:00 + 30min') // LocalTime.of(8, 30)
 * parseHumanTimeWithEquation('08:00 - 30min') // LocalTime.of(7, 30)
 * parseHumanTimeWithEquation('08:00 + 1h + 30min') // LocalTime.of(9, 30)
 */
export function parseHumanTimeWithEquation(value: string): Nullable<LocalTime> {
  // split the input into individual values and operators
  const inputRegex = /(?<operator>[+-])?\s*(?<value>\d+.?\d*\w*)/gi

  const matches = [...value.matchAll(inputRegex)]

  if (isEmpty(matches)) {
    return null
  }

  const values = matches.map((match) => {
    const {operator, value: rawValue} = match.groups!

    const isNegative = operator === '-'
    const duration = parseHumanTime(rawValue)

    return {
      value: duration,
      isNegative
    }
  })

  return values[0].value
}