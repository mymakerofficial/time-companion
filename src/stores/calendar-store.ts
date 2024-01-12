import {defineStore} from "pinia";
import type {ReactiveCalendarDay} from "@/model/calendar-day";
import {reactive, watch} from "vue";
import {useProjectsStore} from "@/stores/projects-store";
import {createDay, fromSerializedDay} from "@/model/calendar-day";

export interface CalendarStore {

}

export const useCalendarStore = defineStore('calendar', () => {
  const projectsStore = useProjectsStore()

  const days = reactive<ReactiveCalendarDay[]>([])

  function init() {
    const serialized = localStorage.getItem('time-companion-calendar-store')
    if (!serialized) {
      return
    }

    const parsed = JSON.parse(serialized)

    const assets = {
      projects: projectsStore.projects,
      activities: projectsStore.activities,
    }

    days.push(...parsed.days.map((it: any) => createDay(fromSerializedDay(it, assets))))
  }

  function store() {
    const serialized = {
      days: days.map((it) => it.toSerialized()),
    }

    localStorage.setItem('time-companion-calendar-store', JSON.stringify(serialized))
  }

  watch(() => days, store, {deep: true})

  return {
    days,
    init,
  }
})