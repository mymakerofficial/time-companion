import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import type {DayTimeReport} from "@/lib/timeReport/types";
import {Temporal} from "temporal-polyfill";
import {createService} from "@/composables/createService";
import {useProjectsService} from "@/services/projectsService";
import {calculateDayTimeReport, createTimeReport} from "@/lib/timeReport/calculateDayTimeReport";
import {daysInMonth} from "@/lib/neoTime";
import {whereDate} from "@/lib/listUtils";
import {isNull} from "@/lib/utils";
import {useCalendarService} from "@/services/calendarService";

export interface TimeReportService {
  getDayTimeReport: (day: ReactiveCalendarDay) => DayTimeReport
  getMonthTimeReport: (month: Temporal.PlainYearMonth) => DayTimeReport[]
}

export const useTimeReportService = createService<TimeReportService>(() => {
  const calendarService = useCalendarService()
  const projectsService = useProjectsService()

  function getDayTimeReport(day: ReactiveCalendarDay) {
    return calculateDayTimeReport(day, projectsService.projects)
  }

  function getMonthTimeReport(month: Temporal.PlainYearMonth) {
    return daysInMonth(month).map((date) => {
      const day = calendarService.days.find(whereDate(date)) ?? null

      if (isNull(day)) {
        return createTimeReport({
          date
        })
      }

      return calculateDayTimeReport(day, projectsService.projects)
    })
  }

  return {
    getDayTimeReport,
    getMonthTimeReport,
  }
})