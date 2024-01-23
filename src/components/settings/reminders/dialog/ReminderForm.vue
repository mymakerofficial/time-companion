<script setup lang="ts">
import {Input} from "@/components/ui/input";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import EventInput from "@/components/common/inputs/EventInput.vue";
import TimeDurationInput from "@/components/common/inputs/TimeDurationInput.vue";
import RepeatOnToggles from "@/components/common/inputs/repeatOn/RepeatOnToggles.vue";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import {Label} from "@/components/ui/label";
import {typeNames} from "@/components/settings/reminders/dialog/constants";
import {computed} from "vue";
import {ReminderActionType} from "@/model/calendarReminder";
import type {ReminderFormState} from "@/components/settings/reminders/dialog/helpers";
import {optionsFromRecord} from "@/helpers/combobox/comboboxHelpers";

const props = defineProps<{
  form: ReminderFormState
}>()

const actionTypeOptions = optionsFromRecord(typeNames)

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
      <Label class="text-right">Name</Label>
      <Input v-model="form.displayText" placeholder="Name" class="col-span-3" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Action</Label>
      <Combobox v-model="form.actionType" :options="actionTypeOptions" />
    </div>
    <div v-if="showTargetInput" class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Start project</Label>
      <EventInput v-model:project="form.actionTargetProject" :activity="form.actionTargetActivity" class="col-span-3" />
    </div>
    <div v-if="showColorInput" class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Color</Label>
      <ColorSelect v-model="form.color" class="col-span-3" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Time</Label>
      <TimeDurationInput v-model="form.remindAtMinutes" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Repeat on</Label>
      <RepeatOnToggles v-model="form.repeatOn" class="col-span-3" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Remind Before</Label>
      <TimeDurationInput v-model="form.remindMinutesBefore" />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Remind After</Label>
      <TimeDurationInput v-model="form.remindMinutesAfter" />
    </div>
  </div>
</template>