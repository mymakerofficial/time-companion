import {computed, reactive} from "vue";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent";
import type {ProjectTimeReportInit, ReactiveProjectTimeReport} from "@/model/projectTimeReport";
import type {Nullable} from "@/lib/utils";
import {createProjectTimeReport} from "@/model/projectTimeReport";
import {isNull} from "@/lib/utils";
import type {ID} from "@/lib/types";

export interface ReactiveTimeReport {
  readonly date: Date
  readonly projects: ReactiveProjectTimeReport[]
  readonly totalDurationMinutes: number
}

export interface TimeReportInit {
  events: ReactiveCalendarEvent[]
  date: Date
}

export function createTimeReport(init: TimeReportInit): ReactiveTimeReport {
  const state = reactive({
    date: init.date,
  })

  const inherits = reactive({
    events: init.events,
  })

  const projects = computed(() => {
    const projectReports = new Map<ID, ProjectTimeReportInit>()

    inherits.events.forEach((event) => {
      if (!event.hasStarted) {
        return
      }

      if (isNull(event.project)) {
        return
      }

      if (!event.project.isBillable) {
        return
      }

      const key = event.project.id
      const projectReport = projectReports.get(key)

      if (projectReport) {
        projectReport.durationMinutes += event.durationMinutes
        if (!event.hasEnded) {
          projectReport.isOngoing = true
        }
      } else {
        projectReports.set(key, {
          project: event.project,
          durationMinutes: event.durationMinutes,
          isOngoing: !event.hasEnded,
        })
      }
    })

    return Array.from(projectReports.values()).map(it => createProjectTimeReport(it))
  })

  const totalDurationMinutes = computed(() => projects.value.reduce((acc, it) => acc + it.durationMinutes, 0))

  return reactive({
    date: computed(() => state.date),
    projects: computed(() => projects.value),
    totalDurationMinutes: computed(() => totalDurationMinutes.value),
  })
}