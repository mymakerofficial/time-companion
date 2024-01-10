import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type {Maybe} from "@/lib/utils";
import {isNotDefined} from "@/lib/utils";

dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)

export function now(): Date {
  return new Date()
}

export function timeStringToDate(timeString: string, format = 'HH:mm:ss'): Date {
  return dayjs(timeString, format).toDate()
}

export function formatDate(date: Date, format = 'HH:mm:ss') {
  return dayjs(date).format(format)
}

export function formatTimeDiff(
  start: Date,
  end: Date,
  format = 'HH:mm:ss',
): string {
  const diff = end.getTime() - start.getTime()

  const prefix = diff < 0 ? '-' : ''

  return prefix + dayjs().startOf('day').add(diff).format(format)
}

export function minutesSinceStartOfDay(date: Maybe<Date>): number {
  if (isNotDefined(date)) {
    return 0
  }

  const startOfDay = dayjs(date).startOf('day')
  return dayjs(date).diff(startOfDay, 'minute')
}

export function formatMinutes(minutes: number, format = 'HH:mm'): string {
  return dayjs().startOf('day').add(minutes, 'minute').format(format)
}

export function formatHours(hours: number, format = 'HH:mm'): string {
  return dayjs().startOf('day').add(hours, 'hours').format(format)
}