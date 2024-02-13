import type {ReactiveProject} from "@/model/project";
import type {ReactiveCalendarDay} from "@/model/calendarDay";
import {sumOf} from "@/lib/listUtils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import {minutesSinceStartOfDay, now} from "@/lib/timeUtils";

export interface TimeReportProjectEntry {
  project: ReactiveProject
  timeMinutes: number
  isBillable: boolean
  isRunning: boolean
}

export interface DayTimeReport {
  date: Date
  totalBillableTimeMinutes: number
  entries: TimeReportProjectEntry[]
}

export type EventDurationCalculator = (event: ReactiveCalendarEvent) => number
export type ProjectTimeCalculator = (project: ReactiveProject, events: ReactiveCalendarEvent[], eventDurationCalculator: EventDurationCalculator) => number

function calculateEventDurationExact(event: ReactiveCalendarEvent) {
  return minutesSinceStartOfDay(event.endedAt ?? now()) - minutesSinceStartOfDay(event.startedAt)
}

function calculateTimeForProjectExact(project: ReactiveProject, events: ReactiveCalendarEvent[], eventDurationCalculator: EventDurationCalculator): number {
  return sumOf(
    events
      .filter((event) => event.project?.id === project.id)
      .map(eventDurationCalculator)
  )
}

export interface TimeReportOptions {
  eventDurationCalculator: EventDurationCalculator
  projectTimeCalculator: ProjectTimeCalculator
}

export function calculateTimeReport(day: ReactiveCalendarDay, projects: ReactiveProject[], options: Partial<TimeReportOptions> = {}): DayTimeReport {
  const {
    eventDurationCalculator = calculateEventDurationExact,
    projectTimeCalculator = calculateTimeForProjectExact,
  } = options

  const date = day.date

  const entries = projects.map((project): TimeReportProjectEntry => ({
    project: project,
    timeMinutes: projectTimeCalculator(project, day.events, eventDurationCalculator),
    isBillable: project.isBillable,
    isRunning: false,
  }))

  const totalBillableTimeMinutes = sumOf(
    entries
      .filter((it) => it.isBillable)
      .map((it) => it.timeMinutes)
  )

  return {
    date,
    totalBillableTimeMinutes,
    entries
  }
}