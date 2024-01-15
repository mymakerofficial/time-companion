import {defineStore} from "pinia";
import {computed, reactive, watch} from "vue";
import type {ReactiveCalendarReminder, SerializedCalendarReminder} from "@/model/calendar-reminder";
import {useLocalStorage} from "@/composables/use-local-storage";
import {createReminder, fromSerializedReminder} from "@/model/calendar-reminder";

export interface RemindersStore {
  reminders: ReactiveCalendarReminder[]
  init: () => void
  addReminder: (reminder: ReactiveCalendarReminder) => void
}

interface RemindersStorageSerialized {
  reminders: SerializedCalendarReminder[]
}

export const useRemindersStore = defineStore('reminders', (): RemindersStore => {
  const storage = useLocalStorage<RemindersStorageSerialized>('time-companion-reminders-store', { reminders: [] })

  const reminders = reactive<ReactiveCalendarReminder[]>([])

  function init() {
    //reset
    reminders.length = 0

    const serialized = storage.get()

    reminders.push(...serialized.reminders.map((it: any) => createReminder(fromSerializedReminder(it))))
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

  return {
    reminders,
    init,
    addReminder,
  }
})