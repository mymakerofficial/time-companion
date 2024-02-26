import {defineStore} from "pinia";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import type {ReactiveCalendarReminder, SerializedCalendarReminder} from "@/model/calendarReminder/types";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {fromSerializedReminder} from "@/model/calendarReminder/serializer";
import {createReminder} from "@/model/calendarReminder/model";
import {useNotifyError} from "@/composables/useNotifyError";
import {migrateSerializedReminder} from "@/model/calendarReminder/migrations";
import {useProjectsService} from "@/services/projectsService";

export interface RemindersStore {
  isInitialized: Readonly<Ref<boolean>>
  reminders: ReactiveCalendarReminder[]
  init: () => void
  addReminder: (reminder: ReactiveCalendarReminder) => void
  removeReminder: (reminder: ReactiveCalendarReminder) => void
}

interface RemindersStorageSerialized {
  version: number
  reminders: SerializedCalendarReminder[]
}

export const useRemindersStore = defineStore('reminders', (): RemindersStore => {
  const projectsService = useProjectsService()
  const storage = useLocalStorage<RemindersStorageSerialized>('time-companion-reminders-store', { version: 0, reminders: [] })

  const isInitialized = ref(false)

  const reminders = reactive<ReactiveCalendarReminder[]>([])

  function init() {
    if (isInitialized.value) {
      return
    }

    // projects need to be initialized first
    projectsService.init()

    const assets = {
      projects: projectsService.projects,
      activities: projectsService.activities,
    }

    try {
      const serialized = storage.get()

      reminders.push(...serialized.reminders.map((it: any) => createReminder(fromSerializedReminder(migrateSerializedReminder(it, serialized.version ?? 0), assets))))

      isInitialized.value = true
    } catch (error) {
      useNotifyError({
        title: 'Failed to load reminders',
        message: 'Your reminders data could not be loaded. Data may be corrupted or missing.',
        actions: [{
          label: 'Delete reminders data',
          handler: () => {
            storage.clear()
            init()
          }
        }],
        error
      })
    }
  }

  function store() {
    if (!isInitialized.value) {
      throw new Error('Tried to commit reminders store before it was initialized')
    }

    storage.set({
      version: 1,
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