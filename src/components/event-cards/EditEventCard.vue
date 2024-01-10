<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {computed, reactive} from "vue";
import TimeDurationInput from "@/components/TimeDurationInput.vue";
import {minutesSinceStartOfDay, minutesSinceStartOfDayToDate} from "@/lib/time-utils";
import {isNotNull, isNull} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendar-event";
import type {ReactiveActivity} from "@/model/activity";

const model = defineModel<ReactiveCalendarEvent>({ required: true })

const emit = defineEmits<{
  continue: [event: ReactiveActivity]
}>()

const state = reactive({
  name: computed({
    get() { return model.value.projectDisplayName || '' },
    set(value) { model.value.projectDisplayName = value }
  }),

  startedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(model.value.startedAt) },
    set(value) { model.value.startedAt = minutesSinceStartOfDayToDate(value) }
  }),

  endedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(model.value.endedAt) },
    set(value) { model.value.endedAt = minutesSinceStartOfDayToDate(value) }
  }),

  durationMinutes: computed({
    get() { return model.value.durationMinutes },
    set(value) { model.value.durationMinutes = value }
  }),
})

function handleContinue() {
  if(isNull(model.value.activity)) {
    return
  }

  emit('continue', model.value.activity)
}
</script>

<template>
  <div class="p-8 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <Input v-model="state.name" class="font-medium text-xl" />
      </div>
      <div class="flex flex-row items-center">
        <TimeDurationInput v-if="model.hasStarted" v-model="state.startedAtMinutes" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
        <span v-if="model.hasEnded" class="text-accent">-</span>
        <TimeDurationInput v-if="model.hasEnded"  v-model="state.endedAtMinutes" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
      </div>
      <div>
        <TimeDurationInput v-if="model.hasEnded" v-model="state.durationMinutes" placeholder="00:00" class="w-20 text-center font-medium text-xl border-none" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button v-if="isNotNull(model.activity)" @click="handleContinue()">Continue</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>