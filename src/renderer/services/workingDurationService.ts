import { createService } from '@renderer/composables/createService'
import { useSettingsStore } from '@renderer/stores/settingsStore'
import { computed, reactive } from 'vue'
import { useTimeReportService } from '@renderer/services/timeReportService'
import type { ReactiveCalendarDay } from '@renderer/model/calendarDay/types'
import { isNotNull, isNull, type Nullable } from '@renderer/lib/utils'
import type { ReactiveProject } from '@renderer/model/project/types'
import { useProjectsService } from '@renderer/services/projectsService'
import { asArray, lastOf } from '@renderer/lib/listUtils'
import {
  durationZero,
  formatDurationIso,
  maxDuration,
  parseDuration,
} from '@renderer/lib/neoTime'
import { mapWritable } from '@renderer/model/modelHelpers'
import type { Duration } from '@shared/lib/datetime/duration'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export interface WorkingDurationService {
  normalWorkingDuration: Duration
  normalBreakDuration: Duration
  readonly normalTotalDuration: Duration
  breakProject: Nullable<ReactiveProject>
  getBreakDurationLeftOnDay: (
    day: ReactiveCalendarDay,
    endAtFallback?: PlainDateTime,
  ) => Duration
  getDurationLeftOnDay: (
    day: ReactiveCalendarDay,
    endAtFallback?: PlainDateTime,
  ) => Duration
  getPredictedEndOfDay: (day: ReactiveCalendarDay) => Nullable<PlainDateTime>
}

export const useWorkingDurationService = createService<WorkingDurationService>(
  () => {
    const store = useSettingsStore()
    const projectsService = useProjectsService()
    const timeReportService = useTimeReportService()

    const normalWorkingDuration = store.getValue('normalWorkingDuration', {
      get: parseDuration,
      set: formatDurationIso,
    })

    const normalBreakDuration = store.getValue('normalBreakDuration', {
      get: parseDuration,
      set: formatDurationIso,
    })

    const normalTotalDuration = computed(() =>
      normalWorkingDuration.value.add(normalBreakDuration.value),
    )

    function getBreakDurationLeftOnDay(
      day: ReactiveCalendarDay,
      endAtFallback?: PlainDateTime,
    ) {
      const breakReport = timeReportService.getDayTimeReport(day, {
        endAtFallback,
        projects: asArray(projectsService.breakProject).filter(isNotNull),
      })

      return normalBreakDuration.value.subtract(breakReport.totalDuration)
    }

    function getDurationLeftOnDay(
      day: ReactiveCalendarDay,
      endAtFallback?: PlainDateTime,
    ) {
      const { totalBillableDuration } = timeReportService.getDayTimeReport(
        day,
        {
          endAtFallback,
        },
      )

      return normalWorkingDuration.value
        .subtract(totalBillableDuration)
        .add(
          maxDuration(
            getBreakDurationLeftOnDay(day, endAtFallback),
            durationZero(),
          ),
        )
    }

    function getPredictedEndOfDay(day: ReactiveCalendarDay) {
      const lastBillableEvent =
        lastOf(day.events.filter((it) => it.project?.isBillable)) ?? null

      if (isNull(lastBillableEvent)) {
        return null
      }

      if (isNotNull(lastBillableEvent.endAt)) {
        return null
      }

      const durationLeft = getDurationLeftOnDay(day)

      return lastBillableEvent.startAt.add(durationLeft)
    }

    return reactive({
      ...mapWritable(projectsService, ['breakProject']),
      normalWorkingDuration,
      normalBreakDuration,
      normalTotalDuration,
      getBreakDurationLeftOnDay,
      getDurationLeftOnDay,
      getPredictedEndOfDay,
    })
  },
)
