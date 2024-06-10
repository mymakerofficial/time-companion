import { Temporal } from 'temporal-polyfill'

export function plainDateTimeFromDate(date: Date): Temporal.PlainDateTime {
  return Temporal.PlainDateTime.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  })
}
