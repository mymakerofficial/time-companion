import {Temporal} from 'temporal-polyfill'
import {createService} from "@/composables/createService";
import {useSettingsStore} from "@/stores/settingsStore";
import {reactive} from "vue";
import {useTimeReportService} from "@/services/timeReportService";
import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import {check, isNull, type Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project/types";
import {useProjectsService} from "@/services/projectsService";
import {whereId} from "@/lib/listUtils";
import {formatDurationIso, parseDuration} from "@/lib/neoTime";

export interface WorkingDurationService {
  normalWorkingDuration: Temporal.Duration
  normalBreakDuration: Temporal.Duration
  breakProject: Nullable<ReactiveProject>
  getDurationLeftOnDay: (day: ReactiveCalendarDay) => Temporal.Duration
  getPredictedEndOfDay: (day: ReactiveCalendarDay) => Nullable<Temporal.PlainDateTime>
}

export const useWorkingDurationService = createService<WorkingDurationService>(() => {
  const store = useSettingsStore()
  const projectsService = useProjectsService()
  const timeReportService = useTimeReportService()

  const normalWorkingDuration = store.getValue('normalWorkingDuration', {
    get: parseDuration,
    set: formatDurationIso
  })

  const normalBreakDuration = store.getValue('normalBreakDuration', {
    get: parseDuration,
    set: formatDurationIso
  })

  const breakProject = store.getValue('breakProjectId', {
    get(id) {
      if (isNull(id)) {
        return null
      }

      return projectsService.projects.find(whereId(id)) ?? null
    },
    set(project){
      check(isNull(project) || projectsService.projects.includes(project),
        `Failed to set break project: Project is not in projects list.`
      )

      return project?.id ?? null
    }
  })

  function getDurationLeftOnDay(day: ReactiveCalendarDay) {
    // TODO include breaks
    const { totalBillableDuration } = timeReportService.getDayTimeReport(day)
    return normalWorkingDuration.value.subtract(totalBillableDuration)
  }

  function getPredictedEndOfDay(day: ReactiveCalendarDay) {
    if (isNull(day.startAt)) {
      return null
    }

    return Temporal.PlainDateTime.from(day.startAt).add(getDurationLeftOnDay(day))
  }

  return reactive({
    normalWorkingDuration,
    normalBreakDuration,
    breakProject,
    getDurationLeftOnDay,
    getPredictedEndOfDay,
  })
})