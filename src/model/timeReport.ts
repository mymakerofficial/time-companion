import {computed, reactive} from "vue";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent";
import type {ProjectTimeReportInit, ReactiveProjectTimeReport} from "@/model/projectTimeReport";
import type {Nullable} from "@/lib/utils";
import {createProjectTimeReport} from "@/model/projectTimeReport";

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
    const projects = new Map<Nullable<string>, ProjectTimeReportInit>()

    for (const event of inherits.events) {
      if (!event.hasStarted) {
        continue
      }

      const key = event.project?.id ?? null
      const project = projects.get(key)

      if (project) {
        project.durationMinutes += event.durationMinutes
        if (!event.hasEnded) {
          project.isOngoing = true
        }
      } else {
        projects.set(key, {
          project: event.project,
          durationMinutes: event.durationMinutes,
          isOngoing: !event.hasEnded,
        })
      }
    }

    return Array.from(projects.values()).map(it => createProjectTimeReport(it))
  })

  const totalDurationMinutes = computed(() => projects.value.reduce((acc, it) => acc + it.durationMinutes, 0))

  return reactive({
    date: computed(() => state.date),
    projects: computed(() => projects.value),
    totalDurationMinutes: computed(() => totalDurationMinutes.value),
  })
}