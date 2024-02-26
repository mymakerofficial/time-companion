import type {ReactiveCalendarReminder} from "@/model/calendarReminder/types";
import {createService} from "@/composables/createService";
import {useRemindersStore} from "@/stores/remidersStore";
import {useInitialize} from "@/composables/useInitialize";
import {useProjectsService} from "@/services/projectsService";
import {migrateSerializedReminder} from "@/model/calendarReminder/migrations";
import {createReminder} from "@/model/calendarReminder/model";
import {fromSerializedReminder} from "@/model/calendarReminder/serializer";
import {check} from "@/lib/utils";
import {whereId} from "@/lib/listUtils";
import {reactive} from "vue";
import {mapReadonly} from "@/model/modelHelpers";

export interface RemindersService {
  reminders: ReadonlyArray<ReactiveCalendarReminder>
  init: () => void
  addReminder: (reminder: ReactiveCalendarReminder) => void
  addReminders: (reminders: ReactiveCalendarReminder[]) => void
  removeReminder: (reminder: ReactiveCalendarReminder) => void
  removeReminders: (reminders: ReactiveCalendarReminder[]) => void
}

export const useRemindersService = createService<RemindersService>(() => {
  const remindersStore = useRemindersStore()

  const { init } = useInitialize(() => {
    const projectsService = useProjectsService()
    projectsService.init()

    const assets = {
      projects: projectsService.projects,
      activities: projectsService.activities
    }

    const serialized = remindersStore.getSerializedStorage()

    const version = serialized.version ?? 0

    const reminders = serialized.reminders
      .map((it) => migrateSerializedReminder(it, version))
      .map((it) => createReminder(fromSerializedReminder(it, assets)))

    addReminders(reminders)
  })

  function addReminder(reminder: ReactiveCalendarReminder) {
    check(!remindersStore.reminders.some(whereId(reminder.id)),
      `Failed to add Reminder: Reminder with id "${reminder.id}" already exists.`
    )
    check(!remindersStore.reminders.some((it) => it.displayText === reminder.displayText),
      `Failed to add Reminder: Reminder with displayText "${reminder.displayText}" already exists.`
    )

    remindersStore.unsafeAddReminder(reminder)
  }

  function addReminders(reminders: ReactiveCalendarReminder[]) {
    reminders.forEach(addReminder)
  }

  function removeReminder(reminder: ReactiveCalendarReminder) {
    check(remindersStore.reminders.includes(reminder),
      `Failed to remove Reminder: Reminder with id "${reminder.id}" does not exist.`
    )

    remindersStore.unsafeRemoveReminder(reminder)
  }

  function removeReminders(reminders: ReactiveCalendarReminder[]) {
    reminders.forEach(removeReminder)
  }

  return reactive({
    ...mapReadonly(remindersStore, [
      'reminders'
    ]),
    init,
    addReminder,
    addReminders,
    removeReminder,
    removeReminders
  })
})