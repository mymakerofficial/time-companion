import {defineStore} from "pinia";
import {createDay, type ReactiveCalendarDay} from "@/model/calendar-day";
import {computed, reactive} from "vue";
import type {Nullable} from "@/lib/utils";
import dayjs from "dayjs";
import {useProjectsStore} from "@/stores/projects-store";
import {useRemindersStore} from "@/stores/remiders-store";
import {useReferenceById} from "@/composables/use-reference-by-id";

export const useTodayStore = defineStore('today', () => {
  const projectsStore = useProjectsStore()
  const remindersStore = useRemindersStore()

  const state = reactive({
    activeDay: null as Nullable<ReactiveCalendarDay>,
  })

  function startDay() {
    if (state.activeDay) {
      throw new Error(`Day is already started`)
    }

    state.activeDay = createDay({
      date: dayjs().startOf('day').toDate(),
    })
  }

  return {
    day: computed(() => state.activeDay),
    startDay,
  }
})