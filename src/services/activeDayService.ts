import type {ReactiveCalendarDay} from "@/model/calendarDay/types";
import {Temporal} from "temporal-polyfill";
import type {Nullable} from "@/lib/utils";
import {check, isDefined} from "@/lib/utils";
import {useActiveDayStore} from "@/stores/activeDayStore";
import {whereDate} from "@/lib/listUtils";
import {createDay} from "@/model/calendarDay/model";
import {useCalendarService} from "@/services/calendarService";
import {reactive} from "vue";
import {mapReadonly} from "@/model/modelHelpers";

export interface ActiveDayService {
  readonly day: Nullable<ReactiveCalendarDay>
  setDay: (day: ReactiveCalendarDay) => void
  unsetDay: () => void
  setByDate: (date: Temporal.PlainDate) => ReactiveCalendarDay
}

export function useActiveDayService({
  activeDayStore = useActiveDayStore(),
  calendarService = useCalendarService()
} = {}): ActiveDayService {
  function setDay(day: ReactiveCalendarDay) {
    check(calendarService.days.includes(day),
      "Failed to set day as active day. Day is not in calendar."
    )

    activeDayStore.unsafeSetDay(day)
  }

  function unsetDay() {
    activeDayStore.unsafeSetDay(null)
  }

  function setByDate(date: Temporal.PlainDate) {
    const existingDay = calendarService.findDay(whereDate(date))

    if (isDefined(existingDay)) {
      setDay(existingDay)
      return existingDay
    }

    const newDay = createDay({
      date
    })

    calendarService.addDay(newDay)
    setDay(newDay)
    return newDay
  }

  return reactive({
    ...mapReadonly(activeDayStore, [
      "day"
    ]),
    setDay,
    unsetDay,
    setByDate
  })
}