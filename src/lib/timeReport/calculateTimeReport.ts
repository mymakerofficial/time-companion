import type {ReactiveProject} from "@/model/project/";
import type {ReactiveCalendarDay} from "@/model/calendarDay";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {durationBetween, now, sumOfDurations} from "@/lib/neoTime";
import {Duration, LocalDate} from "@js-joda/core";

export interface TimeReportProjectEntry {
  project: ReactiveProject
  duration: Duration
  isBillable: boolean
  isRunning: boolean
}

export interface DayTimeReport {
  date: LocalDate
  totalBillableDuration: Duration
  entries: TimeReportProjectEntry[]
}

export type EventDurationCalculator = (event: ReactiveCalendarEvent) => Duration
export type ProjectDurationCalculator = (project: ReactiveProject, events: ReactiveCalendarEvent[], eventDurationCalculator: EventDurationCalculator) => Duration

function calculateEventDurationExact(event: ReactiveCalendarEvent): Duration {
  return durationBetween(event.startedAt, event.endedAt ?? now())
}

function calculateProjectDurationExact(project: ReactiveProject, events: ReactiveCalendarEvent[], eventDurationCalculator: EventDurationCalculator): Duration {
  return sumOfDurations(
    events
      .filter((event) => event.project?.id === project.id)
      .map(eventDurationCalculator)
  )
}

export function createTimeReport(partial: Partial<DayTimeReport>): DayTimeReport {
  return {
    date: partial.date ?? LocalDate.EPOCH_0,
    totalBillableDuration: partial.totalBillableDuration ?? Duration.ZERO,
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