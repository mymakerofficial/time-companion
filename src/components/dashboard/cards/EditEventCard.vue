<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Button} from "@/components/ui/button";
import {computed, reactive} from "vue";
import TimeDurationInput from "@/components/common/inputs/TimeDurationInput.vue";
import {minutesSinceStartOfDay, minutesSinceStartOfDayToDate} from "@/lib/timeUtils";
import {isNotNull} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent";
import type {ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";
import EventInput from "@/components/common/inputs/EventInput.vue";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

const props = defineProps<{
  event: ReactiveCalendarEvent
}>()

const emit = defineEmits<{
  continue: [shadow: ReactiveCalendarEventShadow]
  remove: [event: ReactiveCalendarEvent]
}>()

const state = reactive({
  project: computed({
    get() { return props.event.project },
    set(value) { props.event.project = value }
  }),

  activity: computed({
    get() { return props.event.activity },
    set(value) { props.event.activity = value }
  }),

  note: computed({
    get() { return props.event.note },
    set(value) { props.event.note = value }
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
  emit('continue', props.event.createShadow())
}

function handleRemove() {
  emit('remove', props.event)
}
</script>

<template>
  <div class="p-8 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <EventInput
          v-model:project="state.project"
          v-model:activity="state.activity"
          v-model:note="state.note"
        />
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
        <Button v-if="isNotNull(event.project)" @click="handleContinue()">Continue</Button>
        <DropdownMenu>
          <DropdownMenuTrigger><Button variant="ghost" size="icon"><MoreVertical /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="handleRemove()">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>