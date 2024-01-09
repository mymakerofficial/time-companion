import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)

export type TimeString = `${number}${number}:${number}${number}:${number}${number}`
export function timeStringToDate(timeString: TimeString): Date {
  return dayjs(timeString, 'HH:mm:ss').toDate()
}

export function dateTimeToTimeString(dateTime: Date): TimeString {
  return dayjs(dateTime).format('HH:mm:ss') as TimeString
}

export function formatTimeDiff(
  startTime: Date,
  endTime: Date,
  format = 'HH:mm:ss',
): string {
  const diff = endTime.getTime() - startTime.getTime()

  const prefix = diff < 0 ? '-' : ''

  return prefix + dayjs().startOf('day').add(diff).format(format)
}

export function minsSinceStartOfDay(dateTime: Date): number {
  const startOfDay = dayjs(dateTime).startOf('day')

  return dayjs(dateTime).diff(startOfDay, 'minute')
}