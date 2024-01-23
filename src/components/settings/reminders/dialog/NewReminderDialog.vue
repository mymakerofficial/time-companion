<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {reactive, ref} from "vue";
import {useRemindersStore} from "@/stores/remidersStore";
import {Button} from "@/components/ui/button";
import {createReminderForm, createReminderFromForm} from "@/components/settings/reminders/dialog/helpers";
import ReminderForm from "@/components/settings/reminders/dialog/ReminderForm.vue";

const emit = defineEmits<{
  close: []
}>()

const open = ref(true)
function close() {
  open.value = false
  emit('close')
}

const remindersStore = useRemindersStore()

const form = reactive(createReminderForm())

function handleSubmit() {
  remindersStore.addReminder(createReminderFromForm(form))
  close()
}
</script>

<template>
  <BaseDialog v-model:open="open" title="New Reminder" description="Use reminders to remind you of upcoming events.">
    <ReminderForm :form="form" />
    <template #footer>
      <div class="flex flex-row gap-4 justify-end">
        <Button variant="ghost" @click="close()">Cancel</Button>
        <Button @click="handleSubmit">Create</Button>
      </div>
    </template>
  </BaseDialog>
</template>