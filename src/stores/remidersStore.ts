import {defineStore} from "pinia";
import {reactive, watch} from "vue";
import type {ReactiveCalendarReminder, SerializedCalendarReminder} from "@/model/calendarReminder/types";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {check} from "@/lib/utils";

export interface RemindersStore {
  reminders: ReadonlyArray<ReactiveCalendarReminder>
  getSerializedStorage: () => RemindersStorageSerialized
  unsafeAddReminder: (reminder: ReactiveCalendarReminder) => void
  unsafeRemoveReminder: (reminder: ReactiveCalendarReminder) => void
}

interface RemindersStorageSerialized {
  version: number
  reminders: SerializedCalendarReminder[]
}

export const useRemindersStore = defineStore('reminders', (): RemindersStore => {
  const storage = useLocalStorage<RemindersStorageSerialized>('time-companion-reminders-store', { version: 0, reminders: [] })

  const reminders = reactive<ReactiveCalendarReminder[]>([])

  function commit() {
    storage.set({
      version: 1,
      reminders: reminders.map((it) => it.toSerialized()),
    })
  }

  watch(() => reminders, commit, {deep: true})

  function getSerializedStorage() {
    return storage.get()
  }

  function unsafeAddReminder(reminder: ReactiveCalendarReminder) {
    reminders.push(reminder)
  }

  function unsafeRemoveReminder(reminder: ReactiveCalendarReminder) {
    const index = reminders.indexOf(reminder)

    check(index !== -1, `Failed to remove reminder "${reminder.id}": Reminder does not exist in store.`)

    reminders.splice(index, 1)
  }

  return {
    reminders,
    getSerializedStorage,
    unsafeAddReminder,
    unsafeRemoveReminder,
  }
})