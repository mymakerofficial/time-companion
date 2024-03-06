import {Temporal} from 'temporal-polyfill'
import {createService} from "@/composables/createService";
import {useSettingsStore} from "@/stores/settingsStore";
import {computed, reactive} from "vue";
import {useTimeReportService} from "@/services/timeReportService";
import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import {isNotNull, isNull, type Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project/types";
import {useProjectsService} from "@/services/projectsService";
import {asArray, lastOf} from "@/lib/listUtils";
import {durationZero, formatDurationIso, maxDuration, parseDuration} from "@/lib/neoTime";
import {mapWritable} from "@/model/modelHelpers";

export interface WorkingDurationService {
  normalWorkingDuration: Temporal.Duration
  normalBreakDuration: Temporal.Duration
  readonly normalTotalDuration: Temporal.Duration
  breakProject: Nullable<ReactiveProject>
  getBreakDurationLeftOnDay: (day: ReactiveCalendarDay, endAtFallback?: Temporal.PlainDateTime) => Temporal.Duration
  getDurationLeftOnDay: (day: ReactiveCalendarDay, endAtFallback?: Temporal.PlainDateTime) => Temporal.Duration
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

  const normalTotalDuration = computed(() => normalWorkingDuration.value.add(normalBreakDuration.value))

  function getBreakDurationLeftOnDay(day: ReactiveCalendarDay, endAtFallback?: Temporal.PlainDateTime) {
    const breakReport = timeReportService.getDayTimeReport(day, {
      endAtFallback,
      projects: asArray(projectsService.breakProject).filter(isNotNull)
    })

    return normalBreakDuration.value.subtract(breakReport.totalDuration)
  }

  function getDurationLeftOnDay(day: ReactiveCalendarDay, endAtFallback?: Temporal.PlainDateTime) {
    const { totalBillableDuration } = timeReportService.getDayTimeReport(day, {
      endAtFallback,
    })

    return normalWorkingDuration.value
      .subtract(totalBillableDuration)
      .add(getBreakDurationLeftOnDay(day, endAtFallback))
  }

  function getPredictedEndOfDay(day: ReactiveCalendarDay) {
    const lastBillableEvent = lastOf(day.events.filter(
      (it) => it.project?.isBillable)
    ) ?? null

    if (isNull(lastBillableEvent)) {
      return null
    }

    if (day.events.length === 1) {
      return lastBillableEvent.startAt
        .add(normalTotalDuration.value)
    }

    const { totalBillableDuration } = timeReportService.getDayTimeReport(day)

    return lastBillableEvent.startAt
      .add(normalWorkingDuration.value)
      .subtract(totalBillableDuration)
      .add(
        maxDuration(
          getBreakDurationLeftOnDay(day),
          durationZero()
        )
      )
  }

  return reactive({
    ...mapWritable(projectsService, [
      'breakProject'
    ]),
    normalWorkingDuration,
    normalBreakDuration,
    normalTotalDuration,
    getBreakDurationLeftOnDay,
    getDurationLeftOnDay,
    getPredictedEndOfDay,
  })
})