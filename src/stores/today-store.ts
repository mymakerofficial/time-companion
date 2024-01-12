import {defineStore} from "pinia";
import {createDay, type ReactiveCalendarDay} from "@/model/calendar-day";
import {computed, reactive} from "vue";
import type {Nullable} from "@/lib/utils";
import dayjs from "dayjs";
import {useCalendarStore} from "@/stores/calendar-store";
import {formatDate, now} from "@/lib/time-utils";

export const useTodayStore = defineStore('today', () => {
  const calendarStore = useCalendarStore()

  const state = reactive({
    activeDay: null as Nullable<ReactiveCalendarDay>,
  })

  function init() {
    if (state.activeDay) {
      throw new Error(`Day is already started`)
    }

    const today = calendarStore.days.find((it) => formatDate(it.date, 'YYYY-MM-DD') === formatDate(now(), 'YYYY-MM-DD'))

    if (today) {
      state.activeDay = today
      return
    }

    const newDay = createDay({
      date: dayjs().startOf('day').toDate(),
    })
    calendarStore.days.push(newDay)
    state.activeDay = newDay
  }

  return {
    day: computed(() => state.activeDay),
    init,
  }
})