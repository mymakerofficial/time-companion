import {Temporal} from 'temporal-polyfill'
import {createService} from "@/composables/createService";
import {useSettingsStore} from "@/stores/settingsStore";
import {reactive} from "vue";
import {mapWritable} from "@/model/modelHelpers";
import {useTimeReportService} from "@/services/timeReportService";
import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import {isNull, type Nullable} from "@/lib/utils";

export interface WorkingDurationService {
  workingDuration: Temporal.Duration
  getDurationLeftOnDay: (day: ReactiveCalendarDay) => Temporal.Duration
  getPredictedEndOfDay: (day: ReactiveCalendarDay) => Nullable<Temporal.PlainDateTime>
}

export const useWorkingDurationService = createService<WorkingDurationService>(() => {
  const settingsStore = useSettingsStore()
  const timeReportService = useTimeReportService()

  function getDurationLeftOnDay(day: ReactiveCalendarDay) {
    // TODO include breaks
    const { totalBillableDuration } = timeReportService.getDayTimeReport(day)
    return settingsStore.workingDuration.subtract(totalBillableDuration)
  }

  function getPredictedEndOfDay(day: ReactiveCalendarDay) {
    if (isNull(day.startAt)) {
      return null
    }

    return Temporal.PlainDateTime.from(day.startAt).add(getDurationLeftOnDay(day))
  }

  return reactive({
    ...mapWritable(settingsStore, [
      'workingDuration'
    ]),
    getDurationLeftOnDay,
    getPredictedEndOfDay,
  })
})