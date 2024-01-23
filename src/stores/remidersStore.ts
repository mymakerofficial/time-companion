import {defineStore} from "pinia";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import type {ReactiveCalendarReminder, SerializedCalendarReminder} from "@/model/calendarReminder";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {createReminder, fromSerializedReminder} from "@/model/calendarReminder";
import {useProjectsStore} from "@/stores/projectsStore";

export interface RemindersStore {
  isInitialized: Readonly<Ref<boolean>>
  reminders: ReactiveCalendarReminder[]
  init: () => void
  addReminder: (reminder: ReactiveCalendarReminder) => void
  removeReminder: (reminder: ReactiveCalendarReminder) => void
}

interface RemindersStorageSerialized {
  reminders: SerializedCalendarReminder[]
}

export const useRemindersStore = defineStore('reminders', (): RemindersStore => {
  const projectsStore = useProjectsStore()
  const storage = useLocalStorage<RemindersStorageSerialized>('time-companion-reminders-store', { reminders: [] })

  const isInitialized = ref(false)

  const reminders = reactive<ReactiveCalendarReminder[]>([])

  function init() {
    if (isInitialized.value) {
      return
    }

    // projects need to be initialized first
    projectsStore.init()

    const assets = {
      projects: projectsStore.projects,
      activities: projectsStore.activities,
    }

    const serialized = storage.get()

    reminders.push(...serialized.reminders.map((it: any) => createReminder(fromSerializedReminder(it, assets))))

    isInitialized.value = true
  }

  function store() {
    storage.set({
      reminders: reminders.map((it) => it.toSerialized()),
    })
  }

  watch(() => reminders, store, {deep: true})

  function addReminder(reminder: ReactiveCalendarReminder) {
    if (reminders.some((it) => it.id === reminder.id)) {
      throw new Error(`Reminder with id ${reminder.id} already exists`)
    }

    if (reminders.some((it) => it.displayText === reminder.displayText)) {
      throw new Error(`Reminder with displayText ${reminder.displayText} already exists`)
    }

    reminders.push(reminder)
  }

  function removeReminder(reminder: ReactiveCalendarReminder) {
    const index = reminders.findIndex((it) => it.id === reminder.id)

    if (index === -1) {
      throw new Error(`Reminder with id ${reminder.id} does not exist`)
    }

    reminders.splice(index, 1)
  }

  return {
    isInitialized: readonly(isInitialized),
    reminders,
    init,
    addReminder,
    removeReminder,
  }
})