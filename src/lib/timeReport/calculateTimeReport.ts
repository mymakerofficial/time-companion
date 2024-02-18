import type {ReactiveProject} from "@/model/project/";
import type {ReactiveCalendarDay} from "@/model/calendarDay";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {dateTimeZero, dateZero, durationBetween, durationZero, now, sumOfDurations} from "@/lib/neoTime";
import {Temporal} from "temporal-polyfill";

export interface TimeReportProjectEntry {
  project: ReactiveProject
  duration: Temporal.Duration
  isBillable: boolean
  isRunning: boolean
}

export interface DayTimeReport {
  date: Temporal.PlainDate
  totalBillableDuration: Temporal.Duration
  entries: TimeReportProjectEntry[]
}

export type EventDurationCalculator = (event: ReactiveCalendarEvent) => Temporal.Duration
export type ProjectDurationCalculator = (project: ReactiveProject, events: ReactiveCalendarEvent[], eventDurationCalculator: EventDurationCalculator) => Temporal.Duration

function calculateEventDurationExact(event: ReactiveCalendarEvent): Temporal.Duration {
  return durationBetween(event.startAt ?? dateTimeZero(), event.endAt ?? now())
}

function calculateProjectDurationExact(project: ReactiveProject, events: ReactiveCalendarEvent[], eventDurationCalculator: EventDurationCalculator): Temporal.Duration {
  return sumOfDurations(
    events
      .filter((event) => event.project?.id === project.id)
      .map(eventDurationCalculator)
  )
}

export function createTimeReport(partial: Partial<DayTimeReport>): DayTimeReport {
  return {
    date: partial.date ?? dateZero(),
    totalBillableDuration: partial.totalBillableDuration ?? durationZero(),
    entries: partial.entries ?? []
  }
}

export interface TimeReportOptions {
  eventDurationCalculator?: EventDurationCalculator
  projectDurationCalculator?: ProjectDurationCalculator
}

export function calculateTimeReport(day: ReactiveCalendarDay, projects: ReactiveProject[], options: TimeReportOptions = {}): DayTimeReport {
  const {
    eventDurationCalculator = calculateEventDurationExact,
    projectDurationCalculator = calculateProjectDurationExact,
  } = options

  const date = day.date

  const entries = projects.map((project): TimeReportProjectEntry => ({
    project: project,
    duration: projectDurationCalculator(project, day.events, eventDurationCalculator),
    isBillable: project.isBillable,
    isRunning: day.events
      .filter((event) => event.project?.id === project.id)
      .some((it) => !it.hasEnded),
  }))

  const totalBillableDuration = sumOfDurations(
    entries
      .filter((it) => it.isBillable)
      .map((it) => it.duration)
  )

  return createTimeReport({
    date,
    totalBillableDuration,
    entries
  })
}