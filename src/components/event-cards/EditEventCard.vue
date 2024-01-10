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

const props = defineProps<{
  event: ReactiveCalendarEvent
}>()

const emit = defineEmits<{
  continue: [activity: ReactiveActivity]
}>()

const state = reactive({
  name: computed({
    get() { return props.event.projectDisplayName || '' },
    set(value) { props.event.projectDisplayName = value }
  }),

  startedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(props.event.startedAt) },
    set(value) { props.event.startedAt = minutesSinceStartOfDayToDate(value) }
  }),

  endedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(props.event.endedAt) },
    set(value) { props.event.endedAt = minutesSinceStartOfDayToDate(value) }
  }),

  durationMinutes: computed({
    get() { return props.event.durationMinutes },
    set(value) { props.event.durationMinutes = value }
  }),
})

function handleContinue() {
  if(isNull(props.event.activity)) {
    return
  }

  emit('continue', props.event.activity)
}
</script>

<template>
  <div class="p-8 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <Input v-model="state.name" class="font-medium text-xl" />
      </div>
      <div class="flex flex-row items-center">
        <TimeDurationInput v-if="event.hasStarted" v-model="state.startedAtMinutes" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
        <span v-if="event.hasEnded" class="text-accent">-</span>
        <TimeDurationInput v-if="event.hasEnded"  v-model="state.endedAtMinutes" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
      </div>
      <div>
        <TimeDurationInput v-if="event.hasEnded" v-model="state.durationMinutes" placeholder="00:00" class="w-20 text-center font-medium text-xl border-none" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button v-if="isNotNull(event.activity)" @click="handleContinue()">Continue</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>