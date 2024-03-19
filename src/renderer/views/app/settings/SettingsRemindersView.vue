<script setup lang="tsx">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import { Button } from '@renderer/components/ui/button'
import { useDialogStore } from '@renderer/stores/dialogStore'
import NewReminderDialog from '@renderer/components/settings/reminders/dialog/NewReminderDialog.vue'
import RemindersTable from '@renderer/components/settings/reminders/table/RemindersTable.vue'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import { PlusCircle } from 'lucide-vue-next'
import { useRemindersService } from '@renderer/services/remindersService'

const remindersService = useRemindersService()
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
    <RemindersTable :reminders="remindersService.reminders" />
  </div>
</template>
