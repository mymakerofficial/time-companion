<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {ref} from "vue";
import {Button} from "@/components/ui/button";
import {
  createReminderForm,
  patchReminderWithForm,
} from "@/components/settings/reminders/dialog/helpers";
import ReminderForm from "@/components/settings/reminders/dialog/ReminderForm.vue";
import {isNotDefined, type Nullable} from "@/lib/utils";
import {useRemindersService} from "@/services/remindersService";
import {useGetFrom} from "@/composables/useGetFrom";
import {whereId} from "@/lib/listUtils";
import {reactiveComputed} from "@vueuse/core";

const props = defineProps<{
  id: Nullable<string>
}>()

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const remindersService = useRemindersService()
const reminder = useGetFrom(remindersService.reminders, whereId(props.id))
const form = reactiveComputed(() => createReminderForm(reminder.value))

function handleRemove() {
  if (isNotDefined(reminder.value)) {
    return
  }

  remindersService.removeReminder(reminder.value)

  close()
}

function handleSubmit() {
  if (isNotDefined(reminder.value)) {
    return
  }

  patchReminderWithForm(reminder.value, form)

  close()
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    :title="$t('dialog.reminder.edit.title')"
    :description="$t('dialog.reminder.edit.description')"
  >
    <ReminderForm :form="form" />
    <template #footer>
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex flex-row gap-4">
          <Button variant="destructive" @click="handleRemove">{{ $t('dialog.reminder.controls.delete') }}</Button>
        </div>
        <div class="flex flex-row gap-4">
          <Button variant="ghost" @click="close()">{{ $t('dialog.reminder.controls.cancel') }}</Button>
          <Button @click="handleSubmit">{{ $t('dialog.reminder.controls.save') }}</Button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>