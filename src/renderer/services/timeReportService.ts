import type { ReactiveCalendarDay } from '@renderer/model/calendarDay/types'
import type { DayTimeReport } from '@renderer/lib/timeReport/types'
import { createService } from '@renderer/composables/createService'
import { useProjectsService } from '@renderer/services/projectsService'
import {
  calculateDayTimeReport,
  createTimeReport,
} from '@renderer/lib/timeReport/calculateDayTimeReport'
import { daysInMonth } from '@renderer/lib/neoTime'
import { whereDate } from '@renderer/lib/listUtils'
import { isNull } from '@renderer/lib/utils'
import { useCalendarService } from '@renderer/services/calendarService'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { PlainYearMonth } from '@shared/lib/datetime/plainYearMonth'

export interface GetTimeReportOptions {
  endAtFallback?: PlainDateTime
  projects?: ReadonlyArray<ReactiveProject>
}

export interface TimeReportService {
  getDayTimeReport: (
    day: ReactiveCalendarDay,
    options?: GetTimeReportOptions,
  ) => DayTimeReport
  getMonthTimeReport: (
    month: PlainYearMonth,
    options?: GetTimeReportOptions,
  ) => DayTimeReport[]
}

export const useTimeReportService = createService<TimeReportService>(() => {
  const calendarService = useCalendarService()
  const projectsService = useProjectsService()

  function getDayTimeReport(
    day: ReactiveCalendarDay,
    options: GetTimeReportOptions = {},
  ) {
    const { endAtFallback, projects = projectsService.projects } = options

    return calculateDayTimeReport(day, projects, endAtFallback)
  }

  function getMonthTimeReport(
    month: PlainYearMonth,
    options: GetTimeReportOptions = {},
  ) {
    return daysInMonth(month).map((date) => {
      const day = calendarService.days.find(whereDate(date)) ?? null

      if (isNull(day)) {
        return createTimeReport({
          date,
        })
      }

      return getDayTimeReport(day, options)
    })
  }

  return {
    getDayTimeReport,
    getMonthTimeReport,
  }
})
