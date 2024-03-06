import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import {dateZero, durationZero, sumOfDurations} from "@/lib/neoTime";
import {Temporal} from "temporal-polyfill";
import type {DayTimeReport, TimeReportProjectEntry} from "@/lib/timeReport/types";
import {calculateProjectDurationExact} from "@/lib/timeReport/calculatorExact";

export function createTimeReport(partial: Partial<DayTimeReport>): DayTimeReport {
  return {
    date: partial.date ?? dateZero(),
    totalDuration: partial.totalDuration ?? durationZero(),
    totalBillableDuration: partial.totalBillableDuration ?? durationZero(),
    entries: partial.entries ?? []
  }
}

export function calculateDayTimeReport(day: ReactiveCalendarDay, projects: ReadonlyArray<ReactiveProject>, endAtFallback?: Temporal.PlainDateTime): DayTimeReport {
  const entries = projects.map((project): TimeReportProjectEntry => ({
    project: project,
    duration: calculateProjectDurationExact(project, day.events, endAtFallback),
    isBillable: project.isBillable,
    isRunning: day.events
      .filter((event) => event.project?.id === project.id)
      .some((it) => !it.hasEnded),
  }))

  const totalDuration = sumOfDurations(entries.map((it) => it.duration))

  const totalBillableDuration = sumOfDurations(
    entries
      .filter((it) => it.isBillable)
      .map((it) => it.duration)
  )

  return createTimeReport({
    date: day.date,
    totalDuration,
    totalBillableDuration,
    entries
  })
}