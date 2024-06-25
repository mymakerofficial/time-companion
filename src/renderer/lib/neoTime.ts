import {
  DateTimeFormatter,
  Duration as JodaDuration,
  LocalDate,
  LocalDateTime,
  LocalTime,
} from '@js-joda/core'
import { Locale } from '@js-joda/locale_en'
import { fillZero, isNotNull, round } from '@renderer/lib/utils'
import { PlainDate } from '@shared/lib/datetime/plainDate'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { PlainTime } from '@shared/lib/datetime/plainTime'
import { Duration } from '@shared/lib/datetime/duration'
import { PlainYearMonth } from '@shared/lib/datetime/plainYearMonth'

export function isTemporalDate(date: any): date is PlainDate {
  return date instanceof PlainDate
}

export function isTemporalTime(time: any): time is PlainTime {
  return time instanceof PlainTime
}

export function isTemporalDateTime(dateTime: any): dateTime is PlainDateTime {
  return dateTime instanceof PlainDateTime
}

export function isTemporalDuration(duration: any): duration is Duration {
  return duration instanceof Duration
}

export function temporalToJoda(temporal: PlainDate): LocalDate
export function temporalToJoda(temporal: PlainTime): LocalTime
export function temporalToJoda(temporal: PlainDateTime): LocalDateTime
export function temporalToJoda(temporal: Duration): JodaDuration
export function temporalToJoda(temporal: any): any {
  if (isTemporalDate(temporal)) {
    return LocalDate.of(temporal.year, temporal.month, temporal.day)
  }

  if (isTemporalTime(temporal)) {
    return LocalTime.of(temporal.hour, temporal.minute, temporal.second)
  }

  if (isTemporalDateTime(temporal)) {
    return LocalDateTime.of(
      temporal.year,
      temporal.month,
      temporal.day,
      temporal.hour,
      temporal.minute,
      temporal.second,
    )
  }

  if (isTemporalDuration(temporal)) {
    return JodaDuration.ofMillis(temporal.total({ unit: 'milliseconds' }))
  }
}

export function isJodaDate(date: any): date is LocalDate {
  return date instanceof LocalDate
}

export function isJodaTime(time: any): time is LocalTime {
  return time instanceof LocalTime
}

export function isJodaDateTime(dateTime: any): dateTime is LocalDateTime {
  return dateTime instanceof LocalDateTime
}

export function isJodaDuration(duration: any): duration is JodaDuration {
  return duration instanceof JodaDuration
}

export function jodaToTemporal(joda: LocalDate): PlainDate
export function jodaToTemporal(joda: LocalTime): PlainTime
export function jodaToTemporal(joda: LocalDateTime): PlainDateTime
export function jodaToTemporal(joda: JodaDuration): Duration
export function jodaToTemporal(joda: any): any {
  if (isJodaDate(joda)) {
    return PlainDate.from({
      year: joda.year(),
      month: joda.monthValue(),
      day: joda.dayOfMonth(),
    })
  }

  if (isJodaTime(joda)) {
    return PlainTime.from({
      hour: joda.hour(),
      minute: joda.minute(),
      second: joda.second(),
    })
  }

  if (isJodaDateTime(joda)) {
    return PlainDateTime.from({
      year: joda.year(),
      month: joda.monthValue(),
      day: joda.dayOfMonth(),
      hour: joda.hour(),
      minute: joda.minute(),
      second: joda.second(),
    })
  }

  if (isJodaDuration(joda)) {
    return Duration.from({
      milliseconds: joda.toMillis(),
    })
  }
}

export function currentMonth() {
  return dateToMonth(today())
}

// obtain the current LocalDate
export function today() {
  return PlainDate.now()
}

// obtain the current LocalDateTime
export function now() {
  return PlainDateTime.now()
}

// obtain the current LocalTime
export function timeNow() {
  return PlainTime.now()
}

// obtain a Duration from given hours
export function hours(hours: number = 1) {
  return Duration.from({ hours })
}

// obtain a Duration from given minutes
export function minutes(minutes: number = 1) {
  return Duration.from({ minutes })
}

// obtain a Duration from given seconds
export function seconds(seconds: number = 1) {
  return Duration.from({ seconds })
}

export function durationZero() {
  return Duration.from({ milliseconds: 0 })
}

export function timeZero() {
  return PlainTime.from({ hour: 0, minute: 0, second: 0 })
}

export function dateZero() {
  return PlainDate.from({ year: 0, month: 1, day: 1 })
}

export function dateTimeZero() {
  return PlainDateTime.from({
    year: 0,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
  })
}

export function isZeroDuration(duration: Duration) {
  return duration.total({ unit: 'milliseconds' }) === 0
}

export function withFormat(pattern: string) {
  return DateTimeFormatter.ofPattern(pattern).withLocale(Locale.UK)
}

// parse a string to a Date
export function parseDate(
  dateString: string,
  formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE,
) {
  return jodaToTemporal(LocalDate.parse(dateString, formatter))
}

// format the Date to a string
export function formatDate(
  date: PlainDate,
  formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE,
) {
  return temporalToJoda(date).format(formatter)
}

// parse a string to a Time
export function parseTime(
  timeString: string,
  formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME,
) {
  return jodaToTemporal(LocalTime.parse(timeString, formatter))
}

export function formatTime(
  time: PlainTime,
  formatter?: DateTimeFormatter,
): string
export function formatTime(
  time: PlainDateTime,
  formatter?: DateTimeFormatter,
): string
// format the Time to a string
export function formatTime(
  time: any,
  formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME,
) {
  return temporalToJoda(time).format(formatter)
}

// parse a string to a DateTime
export function parseDateTime(
  dateTimeString: string,
  formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME,
) {
  return jodaToTemporal(LocalDateTime.parse(dateTimeString, formatter))
}

// format the DateTime to a string
export function formatDateTime(
  dateTime: PlainDateTime,
  formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME,
) {
  return temporalToJoda(dateTime).format(formatter)
}

// parse a string to a Duration
export function parseDuration(durationString: string) {
  return jodaToTemporal(JodaDuration.parse(durationString))
}

// format the Duration to a string
export function formatDurationIso(duration: Duration) {
  return duration.toString()
}

export function formatDuration(
  duration: Duration,
  options: { includeSeconds?: boolean } = {},
) {
  const { includeSeconds = false } = options

  const hours = fillZero(round(duration.total({ unit: 'hours' })), 2)
  const minutes = fillZero(round(duration.total({ unit: 'minutes' }) % 60), 2)
  const seconds = fillZero(round(duration.total({ unit: 'seconds' }) % 60), 2)

  return [hours, minutes, includeSeconds ? seconds : null]
    .filter(isNotNull)
    .join(':')
}

export function humanizeDuration(
  duration: Duration,
  options: { includeSeconds?: boolean } = {},
) {
  const { includeSeconds = false } = options

  const hours = round(duration.total({ unit: 'hours' }))
  const minutes = round(duration.total({ unit: 'minutes' }) % 60)
  const seconds = round(duration.total({ unit: 'seconds' }) % 60)

  // TODO i18n
  const parts = [
    hours > 0 ? `${hours}h` : null,
    minutes > 0 || (!includeSeconds && hours <= 0) ? `${minutes}min` : null,
    includeSeconds && (seconds > 0 || minutes == 0) ? `${seconds}s` : null,
  ].filter(isNotNull)

  return parts.join(' ')
}

/***
 * @deprecated Use `PlainTime.compare()` instead
 */
export function timeCompare(a: PlainTime, b: PlainTime) {
  return PlainTime.compare(a, b)
}

/***
 * @deprecated Use `time.isBefore(other)` instead
 */
export function timeIsBefore(start: PlainTime, end: PlainTime) {
  return timeCompare(start, end) < 0
}

/***
 * @deprecated Use `time.isAfter(other)` instead
 */
export function timeIsAfter(start: PlainTime, end: PlainTime) {
  return timeCompare(start, end) > 0
}

/***
 * @deprecated Use `PlainDateTime.compare()` instead
 */
export function dateTimeCompare(a: PlainDateTime, b: PlainDateTime) {
  return PlainDateTime.compare(a, b)
}

/***
 * @deprecated Use `dateTime.isBefore(other)` instead
 */
export function dateTimeIsBefore(start: PlainDateTime, end: PlainDateTime) {
  return dateTimeCompare(start, end) < 0
}

/***
 * @deprecated Use `dateTime.isAfter(other)` instead
 */
export function dateTimeIsAfter(start: PlainDateTime, end: PlainDateTime) {
  return dateTimeCompare(start, end) > 0
}

/***
 * @deprecated Use `date.equals(other)` instead
 */
export function isSameDay(date1: PlainDate, date2: PlainDate) {
  return date1.equals(date2)
}

/***
 * @deprecated Use `dateTime.toPlainTime()` instead
 */
export function toPlainTime(dateTime: PlainDateTime) {
  return PlainTime.from({
    hour: dateTime.hour,
    minute: dateTime.minute,
    second: dateTime.second,
  })
}

/***
 * @deprecated
 */
export function dateWithTime(date: PlainDate, time: PlainTime): PlainDateTime
/***
 * @deprecated
 */
export function dateWithTime(
  date: PlainDateTime,
  time: PlainTime,
): PlainDateTime
export function dateWithTime(date: any, time: any) {
  return PlainDateTime.from({
    year: date.year,
    month: date.month,
    day: date.day,
    hour: time.hour,
    minute: time.minute,
    second: time.second,
  })
}

/***
 * @deprecated Use `time.until()` instead
 */
export function durationBetween(start: PlainTime, end: PlainTime): Duration
/***
 * @deprecated Use `date.until()` instead
 */
export function durationBetween(start: PlainDate, end: PlainDate): Duration
/***
 * @deprecated Use `dateTime.until()` instead
 */
export function durationBetween(
  start: PlainDateTime,
  end: PlainDateTime,
): Duration
export function durationBetween(start: any, end: any) {
  return jodaToTemporal(
    JodaDuration.between(temporalToJoda(start), temporalToJoda(end)),
  )
}

/***
 * @deprecated Use `time.toDuration()` instead
 */
export function durationSinceStartOfDay(time: PlainTime): Duration
/***
 * @deprecated Use `time.toDuration()` instead
 */
export function durationSinceStartOfDay(time: PlainDateTime): Duration
/***
 * @deprecated Use `time.toDuration()` instead
 */
export function durationSinceStartOfDay(time: any) {
  if (isTemporalDateTime(time)) {
    return durationSinceStartOfDay(toPlainTime(time))
  }

  return durationBetween(timeZero(), time)
}

/***
 * given a duration, return the time of day
 * @deprecated Use `duration.toPlainTime()` instead
 */
export function durationToTime(duration: Duration): PlainTime {
  duration.toPlainTime()
  return PlainTime.from({
    hour: duration.total({ unit: 'hours' }),
    minute: duration.total({ unit: 'minutes' }) % 60,
    second: duration.total({ unit: 'seconds' }) % 60,
  })
}

export function dateToMonth(date: PlainDate): PlainYearMonth {
  return PlainYearMonth.from({
    year: date.year,
    month: date.month,
  })
}

/***
 * @deprecated Use `duration.negated()` instead
 */
export function negateDuration(duration: Duration) {
  return Duration.from({
    milliseconds: -duration.total({ unit: 'milliseconds' }),
  })
}

/***
 * @deprecated Use `duration.abs()` instead
 */
export function absDuration(duration: Duration) {
  if (duration.sign === -1) {
    return negateDuration(duration)
  }

  return duration
}

/***
 * @deprecated Use `Duration.compare()` instead
 */
export function compareDuration(a: Duration, b: Duration) {
  return Duration.compare(a, b)
}

export function minDuration(a: Duration, b: Duration) {
  return compareDuration(a, b) < 0 ? a : b
}

export function maxDuration(a: Duration, b: Duration) {
  return compareDuration(a, b) > 0 ? a : b
}

/***
 * @deprecated Use `Duration.sum()` instead
 */
export function sumOfDurations(durations: Duration[]) {
  return durations.reduce((acc, duration) => acc.add(duration), durationZero())
}

// returns a list of all days in the month and year of the given month
export function daysInMonth(month: PlainYearMonth): PlainDate[] {
  const monthLength = month.daysInMonth

  return Array.from({ length: monthLength }, (_, i) => {
    return PlainDate.from({
      year: month.year,
      month: month.month,
      day: i + 1,
    })
  })
}
