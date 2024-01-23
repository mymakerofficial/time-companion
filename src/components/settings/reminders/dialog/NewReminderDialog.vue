<script setup lang="ts">
import BaseDialog from "@/components/common/dialog/BaseDialog.vue";
import {computed, reactive} from "vue";
import {whenever} from "@vueuse/core";
import {Input} from "@/components/ui/input";
import {createReminder, createRepeatOnWeekdays, ReminderActionType} from "@/model/calendarReminder";
import type {Nullable} from "@/lib/utils";
import TimeDurationInput from "@/components/common/inputs/TimeDurationInput.vue";
import {Label} from "@/components/ui/label";
import ColorSelect from "@/components/common/inputs/colorSelect/ColorSelect.vue";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import {typeNames} from "@/components/settings/reminders/dialog/constants";
import {useProjectsStore} from "@/stores/projectsStore";
import {useRemindersStore} from "@/stores/remidersStore";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import EventInput from "@/components/common/inputs/EventInput.vue";
import {Button} from "@/components/ui/button";
import {minutesSinceStartOfDayToDate} from "@/lib/timeUtils";
import {createEventShadow} from "@/model/calendarEventShadow";
import RepeatOnToggles from "@/components/common/inputs/repeatOn/RepeatOnToggles.vue";

const emit = defineEmits<{
  close: []
}>()

const projectsStore = useProjectsStore()
const remindersStore = useRemindersStore()

const state = reactive({
  open: true,
})

whenever(() => !state.open, () => emit('close'))

function close() {
  state.open = false
}

const actionTypeOptions = Object.entries(typeNames).map(([value, label]) => ({
  value,
  label,
}))

const form = reactive({
  displayText: '',
  color: null as Nullable<string>,
  remindAtMinutes: 720,
  remindMinutesBefore: 30,
  remindMinutesAfter: 30,
  repeat: createRepeatOnWeekdays([true, true, true, true, true, false, false]),
  actionType: ReminderActionType.START_EVENT as ReminderActionType,
  actionTargetProject: null as Nullable<ReactiveProject>,
  actionTargetActivity: null as Nullable<ReactiveActivity>,
})

const showTargetInput = computed(() => {
  return form.actionType === ReminderActionType.START_EVENT
})

const showColorInput = computed(() => {
  return form.actionType !== ReminderActionType.START_EVENT
})

function handleSubmit() {
  const shadow = form.actionType === ReminderActionType.START_EVENT ? createEventShadow({
    project: form.actionTargetProject,
    activity: form.actionTargetActivity,
  }) : null

  remindersStore.addReminder(createReminder({
    displayText: form.displayText,
    color: form.color,
    remindAt: minutesSinceStartOfDayToDate(form.remindAtMinutes),
    remindMinutesBefore: form.remindMinutesBefore,
    remindMinutesAfter: form.remindMinutesAfter,
    repeatOn: form.repeat,
    actionType: form.actionType,
    actionTargetShadow: shadow
  }))

  close()
}
</script>

<template>
  <BaseDialog v-model:open="state.open" title="New Reminder" description="Use reminders to remind you of upcoming events.">
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
        <RepeatOnToggles v-model="form.repeat" class="col-span-3" />
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
    <template #footer>
      <div class="flex flex-row gap-4 justify-end">
        <Button variant="ghost" @click="close()">Cancel</Button>
        <Button @click="handleSubmit">Create</Button>
      </div>
    </template>
  </BaseDialog>
</template>