<script setup lang="tsx">
import {useRemindersStore} from "@/stores/remidersStore";
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import {Button} from "@/components/ui/button";
import {useDialogStore} from "@/stores/dialogStore";
import NewReminderDialog from "@/components/settings/reminders/dialog/NewReminderDialog.vue";
import RemindersTable from "@/components/settings/reminders/table/RemindersTable.vue";
import TableActions from "@/components/common/table/TableActions.vue";
import {PlusCircle} from "lucide-vue-next";

const remindersStore = useRemindersStore()
const dialogStore = useDialogStore()

function openNewReminderDialog() {
  dialogStore.openDialog(<NewReminderDialog />)
}
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.reminders.title')"
      :description="$t('settings.reminders.description')"
    />
    <TableActions>
      <Button @click="openNewReminderDialog" size="sm" class="gap-2">
        <PlusCircle class="size-4" />
        <span>{{ $t('settings.reminders.controls.createReminder') }}</span>
      </Button>
    </TableActions>
    <RemindersTable :reminders="remindersStore.reminders" />
  </div>
</template>