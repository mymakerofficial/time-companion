<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {reactive, ref} from "vue";
import {useRemindersStore} from "@/stores/remidersStore";
import {Button} from "@/components/ui/button";
import {
  createReminderForm,
  patchReminderWithForm,
} from "@/components/settings/reminders/dialog/helpers";
import ReminderForm from "@/components/settings/reminders/dialog/ReminderForm.vue";
import {isNull, type Nullable} from "@/lib/utils";
import {useReferenceById} from "@/composables/useReferenceById";

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

const remindersStore = useRemindersStore()
const reminder = useReferenceById(remindersStore.reminders, () => props.id)

const form = reactive(createReminderForm(reminder.value))

function handleRemove() {
  if (isNull(reminder.value)) {
    return
  }

  remindersStore.removeReminder(reminder.value)

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
  <BaseDialog v-model:open="open" title="New Reminder" description="Use reminders to remind you of upcoming events.">
    <ReminderForm :form="form" />
    <template #footer>
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex flex-row gap-4">
          <Button variant="destructive" @click="handleRemove">Delete</Button>
        </div>
        <div class="flex flex-row gap-4">
          <Button variant="ghost" @click="close()">Cancel</Button>
          <Button @click="handleSubmit">Save</Button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>