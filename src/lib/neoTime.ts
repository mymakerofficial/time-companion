import {DateTimeFormatter, Duration, LocalDate, LocalDateTime, LocalTime} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en";

// obtain the current LocalDate
export function today() {
  return LocalDate.now();
}

// obtain the current LocalDateTime
export function now() {
  return LocalDateTime.now();
}

// obtain the current LocalTime
export function timeNow() {
  return LocalTime.now();
}

// obtain a Duration from given hours
export function hours(hours: number) {
  return Duration.ofHours(hours);
}

// obtain a Duration from given minutes
export function minutes(minutes: number) {
  return Duration.ofMinutes(minutes);
}

// obtain a Duration from given seconds
export function seconds(seconds: number) {
  return Duration.ofSeconds(seconds);
}

export function withFormat(pattern: string) {
  return DateTimeFormatter.ofPattern(pattern).withLocale(Locale.UK);
}

// parse a string to a LocalDate
export function parseDate(dateString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE) {
  return LocalDate.parse(dateString, formatter);
}

// format the LocalDate to a string
export function formatDate(date: LocalDate, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE) {
  return date.format(formatter)
}

// parse a string to a LocalTime
export function parseTime(timeString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME) {
  return LocalTime.parse(timeString, formatter)
}

// format the LocalTime to a string
export function formatTime(time: LocalTime, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME) {
  return time.format(formatter)
}

// parse a string to a LocalDateTime
export function parseDateTime(dateTimeString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return LocalDateTime.parse(dateTimeString, formatter);
}

// format the LocalDateTime to a string
export function formatDateTime(dateTime: LocalDateTime, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return dateTime.format(formatter)
}

// parse a string to a Duration
export function parseDuration(durationString: string) {
  return Duration.parse(durationString)
}

// format the Duration to a string
export function formatDuration(duration: Duration) {
  return duration.toString()
}

export function isBefore(start: LocalDateTime, end: LocalDateTime) {
  return start.isBefore(end)
}

export function isAfter(start: LocalDateTime, end: LocalDateTime) {
  return start.isAfter(end)
}

export function isSameDay(date1: LocalDate, date2: LocalDate) {
  return date1.equals(date2)
}

export function durationBetween(start: LocalDateTime, end: LocalDateTime) {
  return Duration.between(start, end)
}

export function sumOfDurations(durations: Duration[]) {
  return durations.reduce((acc, duration) => acc.plus(duration), Duration.ZERO)
}

// returns a list of all days in the month and year of the given date
export function daysInMonth(date: LocalDate): LocalDate[] {
  const monthLength = date.lengthOfMonth()

  return Array.from({ length: monthLength }, (_, i) => {
    return date.withDayOfMonth(i + 1)
  })
}