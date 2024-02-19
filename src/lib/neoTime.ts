import {DateTimeFormatter, Duration, LocalDate, LocalDateTime, LocalTime, nativeJs} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en";
import {Temporal} from "temporal-polyfill";

export function isTemporalDate(date: any): date is Temporal.PlainDate {
  return date instanceof Temporal.PlainDate
}

export function isTemporalTime(time: any): time is Temporal.PlainTime {
  return time instanceof Temporal.PlainTime
}

export function isTemporalDateTime(dateTime: any): dateTime is Temporal.PlainDateTime {
  return dateTime instanceof Temporal.PlainDateTime
}

export function isTemporalDuration(duration: any): duration is Temporal.Duration {
  return duration instanceof Temporal.Duration
}

export function temporalToJoda(temporal: Temporal.PlainDate): LocalDate
export function temporalToJoda(temporal: Temporal.PlainTime): LocalTime
export function temporalToJoda(temporal: Temporal.PlainDateTime): LocalDateTime
export function temporalToJoda(temporal: Temporal.Duration): Duration
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
      temporal.second
    )
  }

  if (isTemporalDuration(temporal)) {
    return Duration.ofMillis(temporal.total({unit: 'milliseconds'}))
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

export function isJodaDuration(duration: any): duration is Duration {
  return duration instanceof Duration
}

export function jodaToTemporal(joda: LocalDate): Temporal.PlainDate
export function jodaToTemporal(joda: LocalTime): Temporal.PlainTime
export function jodaToTemporal(joda: LocalDateTime): Temporal.PlainDateTime
export function jodaToTemporal(joda: Duration): Temporal.Duration
export function jodaToTemporal(joda: any): any {
  if (isJodaDate(joda)) {
    return Temporal.PlainDate.from({
      year: joda.year(),
      month: joda.monthValue(),
      day: joda.dayOfMonth()
    })
  }

  if (isJodaTime(joda)) {
    return Temporal.PlainTime.from({
      hour: joda.hour(),
      minute: joda.minute(),
      second: joda.second(),
    })
  }

  if (isJodaDateTime(joda)) {
    return Temporal.PlainDateTime.from({
      year: joda.year(),
      month: joda.monthValue(),
      day: joda.dayOfMonth(),
      hour: joda.hour(),
      minute: joda.minute(),
      second: joda.second(),
    })
  }

  if (isJodaDuration(joda)) {
    return Temporal.Duration.from({
      milliseconds: joda.toMillis()
    })
  }
}


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

export function durationZero() {
  return Temporal.Duration.from({ milliseconds: 0 })
}

export function timeZero() {
  return Temporal.PlainTime.from({ hour: 0, minute: 0, second: 0 })
}

export function dateZero() {
  return Temporal.PlainDate.from({ year: 0, month: 1, day: 1 })
}

export function dateTimeZero() {
  return Temporal.PlainDateTime.from({ year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 })
}

export function isZeroDuration(duration: Temporal.Duration) {
  return duration.total({unit: 'milliseconds'}) === 0
}

export function withFormat(pattern: string) {
  return DateTimeFormatter.ofPattern(pattern).withLocale(Locale.UK);
}

// parse a string to a Date
export function parseDate(dateString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE) {
  return jodaToTemporal(LocalDate.parse(dateString, formatter))
}

// format the Date to a string
export function formatDate(date: Temporal.PlainDate, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE) {
  return temporalToJoda(date).format(formatter)
}

// parse a string to a Time
export function parseTime(timeString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME) {
  return jodaToTemporal(LocalTime.parse(timeString, formatter))
}

export function formatTime(time: Temporal.PlainTime, formatter?: DateTimeFormatter): string
export function formatTime(time: Temporal.PlainDateTime, formatter?: DateTimeFormatter): string
// format the Time to a string
export function formatTime(time: any, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_TIME) {
  return temporalToJoda(time).format(formatter)
}

// parse a string to a DateTime
export function parseDateTime(dateTimeString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return jodaToTemporal(LocalDateTime.parse(dateTimeString, formatter))
}

// format the DateTime to a string
export function formatDateTime(dateTime: Temporal.PlainDateTime, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return temporalToJoda(dateTime).format(formatter)
}

// parse a string to a Duration
export function parseDuration(durationString: string) {
  return jodaToTemporal(Duration.parse(durationString))
}

// format the Duration to a string
export function formatDuration(duration: Temporal.Duration, formatter: any = null /* todo */) {
  return temporalToJoda(duration).toString()
}

export function isBefore<T extends Temporal.PlainDateTimeLike>(start: T, end: T) {
  return Temporal.PlainTime.compare(start, end) < 0
}

export function isAfter<T extends Temporal.PlainDateTimeLike>(start: T, end: T) {
  return Temporal.PlainTime.compare(start, end) > 0
}

export function isSameDay(date1: Temporal.PlainDate, date2: Temporal.PlainDate) {
  return date1.equals(date2)
}

export function toPlainTime(dateTime: Temporal.PlainDateTime) {
  return Temporal.PlainTime.from({
    hour: dateTime.hour,
    minute: dateTime.minute,
    second: dateTime.second
  })
}

export function dateWithTime(date: Temporal.PlainDate, time: Temporal.PlainTime): Temporal.PlainDateTime
export function dateWithTime(date: Temporal.PlainDateTime, time: Temporal.PlainTime): Temporal.PlainDateTime
export function dateWithTime(date: any, time: any) {
  return Temporal.PlainDateTime.from({
    year: date.year,
    month: date.month,
    day: date.day,
    hour: time.hour,
    minute: time.minute,
    second: time.second
  })
}

export function durationBetween(start: Temporal.PlainTime, end: Temporal.PlainTime): Temporal.Duration
export function durationBetween(start: Temporal.PlainDate, end: Temporal.PlainDate): Temporal.Duration
export function durationBetween(start: Temporal.PlainDateTime, end: Temporal.PlainDateTime): Temporal.Duration
export function durationBetween(start: any, end: any) {
  return jodaToTemporal(Duration.between(
    temporalToJoda(start),
    temporalToJoda(end)
  ))
}

export function durationSinceStartOfDay(time: Temporal.PlainTime): Temporal.Duration
export function durationSinceStartOfDay(time: Temporal.PlainDateTime): Temporal.Duration
export function durationSinceStartOfDay(time: any) {
  if (isTemporalDateTime(time)) {
    return durationSinceStartOfDay(toPlainTime(time))
  }

  return durationBetween(timeZero(), time)
}

export function sumOfDurations(durations: Temporal.Duration[]) {
  return durations.reduce((acc, duration) => acc.add(duration), durationZero())
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