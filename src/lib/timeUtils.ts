import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type {Maybe} from "@/lib/utils";
import {isNotDefined} from "@/lib/utils";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)

/** @deprecated switch to js-joda */
export function now(): Date {
  return new Date()
}

/** @deprecated switch to js-joda */
export function timeStringToDate(timeString: string, format = 'HH:mm:ss'): Date {
  return dayjs(timeString, format).toDate()
}

/** @deprecated switch to js-joda */
export function formatDate(date: Maybe<Date>, format = 'HH:mm:ss') {
  if (isNotDefined(date)) {
    return ''
  }
  return dayjs(date).format(format)
}

/** @deprecated switch to js-joda */
export function parseDate(dateString: string, format?: string): Date {
  return dayjs(dateString, format).toDate()
}

/** @deprecated switch to js-joda */
export function formatTimeDiff(
  start: Date,
  end: Date,
  format = 'HH:mm:ss',
): string {
  const diff = end.getTime() - start.getTime()

  const prefix = diff < 0 ? '-' : ''

  return prefix + dayjs().startOf('day').add(diff).format(format)
}

/** @deprecated switch to js-joda */
export function fromNow(date: Date): string {
  return dayjs(date).fromNow()
}

/** @deprecated switch to js-joda */
export function minutesSinceStartOfDay(date: Maybe<Date>): number {
  if (isNotDefined(date)) {
    return 0
  }

  const startOfDay = dayjs(date).startOf('day')
  return dayjs(date).diff(startOfDay, 'minute')
}

/** @deprecated switch to js-joda */
export function minutesSinceStartOfDayToDate(minutes: number): Date {
  return dayjs().startOf('day').add(minutes, 'minute').toDate()
}

/** @deprecated switch to js-joda */
export function formatMinutes(minutes: Maybe<number>, format = 'HH:mm'): string {
  if (isNotDefined(minutes)) {
    return ''
  }
  return dayjs().startOf('day').add(minutes, 'minute').format(format)
}

/** @deprecated switch to js-joda */
export function formatHours(hours: Maybe<number>, format = 'HH:mm'): string {
  if (isNotDefined(hours)) {
    return ''
  }
  return dayjs().startOf('day').add(hours, 'hours').format(format)
}

/** @deprecated switch to js-joda */
export function combineDateAndTime(date: Date, time: Date): Date {
  return dayjs(date)
    .set('hour', dayjs(time).hour())
    .set('minute', dayjs(time).minute())
    .set('second', dayjs(time).second())
    .set('millisecond', dayjs(time).millisecond())
    .toDate()
}

/** @deprecated switch to js-joda */
export function isSameDay(date1: Date, date2: Date): boolean {
  return dayjs(date1).isSame(date2, 'day')
}

/**
 * returns a list of days in the month of the given date
 * @deprecated switch to js-joda
*/
export function daysInMonth(date: Date): Date[] {
  const daysInMonth = dayjs(date).daysInMonth()
  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(dayjs(date).set('date', i).toDate())
  }
  return days
}