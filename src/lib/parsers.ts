import {isNotDefined, type Nullable} from "@/lib/utils";
import {isEmpty, sumOf} from "@/lib/listUtils";

/**
 * Parses any single human-readable duration input into a number of minutes
 * @param value The input to parse
 * @returns The number of minutes, or null if the duration could not be parsed
 * @example
 * parseDuration('1.5h') // 90
 * parseDuration('1:30') // 90
 * parseDuration('130') // 90
 * parseDuration('1 30') // 90
 * parseDuration('90m') // 90
 * parseDuration('1h') // 60
 */
export function parseDuration(value: string): Nullable<number> {
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
    return hours * 60 + minutes
  }

  if (hour !== undefined) {
    // value is given in hours and minutes (e.g. 1:30)
    return parseInt(hour) * 60 + (parseInt(minute) || 0)
  }

  if (valueString !== undefined) {
    // value is given in minutes or hours (e.g. 90m or 1h)
    const isMinutes = unit === 'm' || unit === 'min' || unit === 'minute'
    return parseInt(valueString) * (isMinutes ? 1 : 60)
  }

  return null
}

/**
 * Parses any human-readable duration input, including equations, into a number of minutes
 * @param value The input to parse
 * @returns The number of minutes, or null if the duration could not be parsed
 * @example
 * parseDurationEquation('08:00 + 30min') // 510
 * parseDurationEquation('08:00 - 30min') // 390
 * parseDurationEquation('08:00 + 1h + 30min') // 630
 */
export function parseDurationEquation(value: string): Nullable<number> {
  // split the input into individual values and operators
  const inputRegex = /(?<operator>[+-])?\s*(?<value>\d+.?\d*\w*)/gi

  const matches = [...value.matchAll(inputRegex)]

  if (isEmpty(matches)) {
    return null
  }

  const values = matches.map((match) => {
    const {operator, value: rawValue} = match.groups!

    const isNegative = operator === '-'

    return (parseDuration(rawValue) || 0) * (isNegative ? -1 : 1)
  })

  return sumOf(values)
}