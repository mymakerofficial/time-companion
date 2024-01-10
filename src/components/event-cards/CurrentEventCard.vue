<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {computed, reactive, watch} from "vue";
import {useNow} from "@vueuse/core";
import {MoreVertical} from "lucide-vue-next";
import TimeDurationInput from "@/components/TimeDurationInput.vue";
import {formatTimeDiff, minutesSinceStartOfDay, minutesSinceStartOfDayToDate} from "@/lib/time-utils";
import {isNotDefined, isNotNull, isNull, type Nullable, runIf} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendar-event";

const props = defineProps<{
  event: Nullable<ReactiveCalendarEvent>
}>()

const emit = defineEmits<{
  startEvent: []
  stopEvent: []
}>()

const now = useNow()

const state = reactive({
  name: '',

  startedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(props.event?.startedAt) },
    set(value: number) { runIf(props.event, isNotNull, () => props.event!.startedAt = minutesSinceStartOfDayToDate(value)) }
  }),

  isRunning: computed(() => isNotNull(props.event) && props.event.hasStarted && !props.event.hasEnded)
})

watch(() => props.event?.projectDisplayName, () => {
  if (isNull(props.event)) {
    return
  }

  if (isNotNull(props.event.projectDisplayName)) {
    // if a name is already set by the parent, use that
    state.name = props.event.projectDisplayName
  } else {
    // otherwise, use the input value
    props.event.projectDisplayName = state.name
  }
})

watch(() => state.name, () => {
  if (isNull(props.event)) {
    return
  }

  props.event.projectDisplayName = state.name
})

function handleStartStop() {
  if (isNull(props.event)) {
    emit('startEvent')
  } else {
    emit('stopEvent')
  }
}

const durationLabel = computed(() => {
  if (isNotDefined(props.event?.startedAt)) {
    return '00:00:00'
  }

  // time between now and startedAt in HH:mm:ss
  return formatTimeDiff(props.event!.startedAt, now.value)
})
</script>

<template>
  <div class="p-8 bg-primary text-primary-foreground flex flex-col gap-2">
    <div class="flex flex-row justify-between items-center gap-8">
      <div class="flex-grow">
        <Input v-model="state.name" placeholder="what are you working on?" class="bg-primary text-primary-foreground border-none font-medium text-xl" />
      </div>
      <div class="flex flex-row items-center gap-8">
        <TimeDurationInput v-if="state.isRunning" v-model="state.startedAtMinutes" class="w-16 text-center font-medium text-sm border-none bg-primary text-primary-foreground" />
        <time class="text-2xl font-medium tracking-wide w-24">{{ durationLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button @click="handleStartStop" variant="inverted">{{ state.isRunning ? 'Stop' : 'Start' }}</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>