<script setup lang="ts">
import {Input} from "@/components/ui/input";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import EventInput from "@/components/common/inputs/EventInput.vue";
import TimeDurationInput from "@/components/common/inputs/TimeDurationInput.vue";
import RepeatOnToggles from "@/components/common/inputs/repeatOn/RepeatOnToggles.vue";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import {Label} from "@/components/ui/label";
import {computed} from "vue";
import {ReminderActionType} from "@/model/calendarReminder";
import type {ReminderFormState} from "@/components/settings/reminders/dialog/helpers";

const props = defineProps<{
  form: ReminderFormState
}>()

const showTargetInput = computed(() => {
  return props.form.actionType === ReminderActionType.START_EVENT
})

const showColorInput = computed(() => {
  return props.form.actionType !== ReminderActionType.START_EVENT
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.displayText.label') }}</Label>
      <Input v-model="form.displayText" class="col-span-3" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.actionType.label') }}</Label>
      <Combobox
        v-model="form.actionType"
        :options="Object.keys(ReminderActionType)"
        :display-value="(value) => $t(`reminder.actionType.${value}`)"
      />
    </div>
    <div v-if="showTargetInput" class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.actionTarget.label') }}</Label>
      <EventInput v-model:project="form.actionTargetProject" v-model:activity="form.actionTargetActivity" class="col-span-3" />
    </div>
    <div v-if="showColorInput" class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.color.label') }}</Label>
      <ColorSelect v-model="form.color" class="col-span-3" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.remindAt.label') }}</Label>
      <TimeDurationInput v-model="form.remindAtMinutes" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.repeatOn.label') }}</Label>
      <RepeatOnToggles v-model="form.repeatOn" class="col-span-3" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.remindMinutesBefore.label') }}</Label>
      <TimeDurationInput v-model="form.remindMinutesBefore" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">{{ $t('dialog.reminder.form.remindMinutesAfter.label') }}</Label>
      <TimeDurationInput v-model="form.remindMinutesAfter" />
    </div>
  </div>
</template>