<script setup lang="tsx">
import {useRemindersStore} from "@/stores/remidersStore";
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import {Button} from "@/components/ui/button";
import {useDialogStore} from "@/stores/dialogStore";
import NewReminderDialog from "@/components/settings/reminders/dialog/NewReminderDialog.vue";

const reminderStore = useRemindersStore()
const dialogStore = useDialogStore()

function openNewReminderDialog() {
  dialogStore.openDialog(<NewReminderDialog />)
}
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Reminders" description="Manage your reminders" />
    <Button @click="openNewReminderDialog">Add Reminder</Button>
    <pre>{{ reminderStore.reminders.map((it) => it.toSerialized()) }}</pre>
  </div>
</template>