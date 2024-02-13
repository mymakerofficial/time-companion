import {DateTimeFormatter, Duration, LocalDate, LocalDateTime} from "@js-joda/core";

export const ISO_DATE_FORMAT = 'yyyy-MM-dd'
export const ISO_TIME_FORMAT = 'HH:mm:ss'
export const ISO_DATE_TIME_FORMAT = 'yyyy-MM-ddTHH:mm:ss'

// obtain the current LocalDate
export function today() {
  return LocalDate.now();
}

// obtain the current LocalDateTime
export function now() {
  return LocalDateTime.now();
}

// parse a string to a LocalDate
export function parseDate(dateString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE) {
  return LocalDate.parse(dateString, formatter);
}

// format the LocalDate to a string
export function formatDate(date: LocalDate, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE) {
  return date.format(formatter)
}

// parse a string to a LocalDateTime
export function parseDateTime(dateTimeString: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return LocalDateTime.parse(dateTimeString, formatter);
}

// format the LocalDateTime to a string
export function formatDateTime(dateTime: LocalDateTime, formatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME) {
  return dateTime.format(formatter)
}

export function isBefore(start: LocalDateTime, end: LocalDateTime) {
  return start.isBefore(end)
}

export function isAfter(start: LocalDateTime, end: LocalDateTime) {
  return start.isAfter(end)
}

export function durationBetween(start: LocalDateTime, end: LocalDateTime) {
  return Duration.between(start, end)
}