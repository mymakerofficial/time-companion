<script setup lang="ts">
import BaseDialog from "@renderer/components/common/dialog/BaseDialog.vue";
import {reactive, ref} from "vue";
import {Button} from "@renderer/components/ui/button";
import {createReminderForm, createReminderFromForm} from "@renderer/components/settings/reminders/dialog/helpers";
import ReminderForm from "@renderer/components/settings/reminders/dialog/ReminderForm.vue";
import {useRemindersService} from "@renderer/services/remindersService";

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const remindersService = useRemindersService()

const form = reactive(createReminderForm())

function handleSubmit() {
  remindersService.addReminder(createReminderFromForm(form))
  close()
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.reminder.new.title')"
    :description="$t('dialog.reminder.new.description')"
  >
    <ReminderForm :form="form" />
    <template #footer>
      <div class="flex flex-row gap-4 justify-end">
        <Button variant="ghost" @click="close()">{{ $t('dialog.reminder.controls.cancel') }}</Button>
        <Button @click="handleSubmit">{{ $t('dialog.reminder.controls.create') }}</Button>
      </div>
    </template>
  </BaseDialog>
</template>