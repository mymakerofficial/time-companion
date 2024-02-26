<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {reactive, ref} from "vue";
import {Button} from "@/components/ui/button";
import {
  createReminderForm,
  patchReminderWithForm,
} from "@/components/settings/reminders/dialog/helpers";
import ReminderForm from "@/components/settings/reminders/dialog/ReminderForm.vue";
import {isNull, type Nullable} from "@/lib/utils";
import {useReferenceById} from "@/composables/useReferenceById";
import {useRemindersService} from "@/services/remindersService";

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
const reminder = useReferenceById(remindersService.reminders, () => props.id)

const form = reactive(createReminderForm(reminder.value))

function handleRemove() {
  if (isNull(reminder.value)) {
    return
  }

  remindersService.removeReminder(reminder.value)

  close()
}

function handleSubmit() {
  if (isNull(reminder.value)) {
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