import {DateTimeFormatter, Duration, LocalDate, LocalDateTime, LocalTime, nativeJs} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en";
import {Temporal} from "temporal-polyfill";
import {isDefined} from "@/lib/utils";

// obtain the current LocalDate
export function today() {
  return Temporal.Now.plainDateISO()
}

// obtain the current LocalDateTime
export function now() {
  return Temporal.Now.plainDateTimeISO()
}

// obtain the current LocalTime
export function timeNow() {
  return Temporal.Now.plainTimeISO()
}

// obtain a Duration from given hours
export function hours(hours: number) {
  return Temporal.Duration.from({ hours })
}

// obtain a Duration from given minutes
export function minutes(minutes: number) {
  return Temporal.Duration.from({ minutes })
}

// obtain a Duration from given seconds
export function seconds(seconds: number) {
  return Temporal.Duration.from({ seconds })
}

export function withFormat(pattern: string) {
  return DateTimeFormatter.ofPattern(pattern).withLocale(Locale.UK);
}

// parse a string to a LocalDate
export function parseDate(dateString: string) {
  return Temporal.PlainDate.from(dateString)
}

// format the LocalDate to a string
export function formatDate(date: Temporal.PlainDate, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE) {
  return date.toString()
}

// parse a string to a LocalTime
export function parseTime(timeString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME) {
  return Temporal.PlainTime.from(timeString)
}

// format the LocalTime to a string
export function formatTime(time: Temporal.PlainTime, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME) {
  return time.toString()
}

// parse a string to a LocalDateTime
export function parseDateTime(dateTimeString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return Temporal.PlainDate.from(dateTimeString)
}

// format the LocalDateTime to a string
export function formatDateTime(dateTime: Temporal.PlainDateTime, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return dateTime.toString()
}

// parse a string to a Duration
export function parseDuration(durationString: string) {
  return Temporal.Duration.from(durationString)
}

// format the Duration to a string
export function formatDuration(duration: Temporal.Duration) {
  return duration.toString()
}

export function isBefore<T extends Temporal.PlainDateTimeLike>(start: T, end: T) {
  console.log(start, end)
  return Temporal.PlainTime.compare(start, end) < 0
}

export function isAfter<T extends Temporal.PlainDateTimeLike>(start: T, end: T) {
  return Temporal.PlainTime.compare(start, end) > 0
}

export function isSameDay(date1: Temporal.PlainDate, date2: Temporal.PlainDate) {
  return date1.equals(date2)
}

export function durationBetween<T extends Temporal.PlainDateTimeLike>(start: T, end: T) {
  const startJoda = isDefined(start.year) && isDefined(start.month) && isDefined(start.day)  ?
    LocalDateTime.of(start.year, start.month, start.day, start.hour, start.minute, start.second)
    : LocalTime.of(start.hour, start.minute, start.second)
  const endJoda = isDefined(end.year) && isDefined(end.month) && isDefined(end.day)  ?
    LocalDateTime.of(end.year, end.month, end.day, end.hour, end.minute, end.second)
    : LocalTime.of(end.hour, end.minute, end.second)

  const duration = Duration.between(startJoda, endJoda)

  return Temporal.Duration.from({
    milliseconds: duration.toMillis()
  })
}

export function sumOfDurations(durations: Temporal.Duration[]) {
  return durations.reduce((acc, duration) => acc.add(duration), Temporal.Duration.from({ milliseconds: 0 }))
}

// returns a list of all days in the month and year of the given date
export function daysInMonth(date: Temporal.PlainDate): Temporal.PlainDate[] {
  const monthLength = date.daysInMonth

  return Array.from({length: monthLength}, (_, i) => {
    return Temporal.PlainDate.from({
      year: date.year,
      month: date.month,
      day: i + 1
    })
  })
}