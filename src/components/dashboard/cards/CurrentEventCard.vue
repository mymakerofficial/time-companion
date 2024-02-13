<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {computed, reactive, watch} from "vue";
import {useNow, watchDebounced} from "@vueuse/core";
import {MoreVertical} from "lucide-vue-next";
import TimeDurationInput from "@/components/common/inputs/TimeDurationInput.vue";
import {formatTimeDiff, minutesSinceStartOfDay, minutesSinceStartOfDayToDate} from "@/lib/timeUtils";
import {isNotDefined, isNotNull, isNull, type Nullable, runIf} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import dayjs from "dayjs";
import ProjectActionInput from "@/components/common/inputs/projectActionInput/ProjectActionInput.vue";

const props = defineProps<{
  event: Nullable<ReactiveCalendarEvent>
}>()

const emit = defineEmits<{
  startEvent: []
  stopEvent: []
}>()

const now = useNow({ interval: 1000 }) // update every minute

const state = reactive({
  project: props.event?.project ?? null as Nullable<ReactiveProject>,
  activity: props.event?.activity ?? null as Nullable<ReactiveActivity>,
  note: props.event?.note ?? '',

  startedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(props.event?.startedAt) },
    set(value: number) { runIf(props.event, isNotNull, () => props.event!.startedAt = minutesSinceStartOfDayToDate(value)) }
  }),

  isRunning: computed(() => isNotNull(props.event) && props.event.hasStarted && !props.event.hasEnded)
})

watch(() => state.project, (value) => {
  runIf(props.event, isNotNull, () => props.event!.project = value)
})
watch(() => state.activity, (value) => {
  runIf(props.event, isNotNull, () => props.event!.activity = value)
})
watch(() => state.note, (value) => {
  runIf(props.event, isNotNull, () => props.event!.note = value)
})

watchDebounced(() => state.project, (value) => {
  if (isNull(value)) {
    return
  }

  value.lastUsedNow()
}, { debounce: 500 })
watchDebounced(() => state.activity, (value) => {
  if (isNull(value)) {
    return
  }

  value.lastUsedNow()
}, { debounce: 500 })

watch(() => props.event, (value) => {
  if (isNull(value)) {
    state.project = null
    state.activity = null
    state.note = ''
    return
  }

  if (isNull(value.project)) {
    // if no project is set by the parent, use the user input
    value.project = state.project
    value.activity = state.activity
    value.note = state.note
    return
  }

  state.project = value?.project ?? null
  state.activity = value?.activity ?? null
  state.note = value?.note ?? ''
})
watch(() => props.event?.project, (value) => {
  state.project = value ?? null
})
watch(() => props.event?.activity, (value) => {
  state.activity = value ?? null
})

function handleStartStop() {
  if (isNull(props.event)) {
    emit('startEvent')
  } else {
    emit('stopEvent')
  }
}

const durationLabel = computed(() => {
  if (
    isNotDefined(props.event?.startedAt) ||
    dayjs(props.event!.startedAt).isAfter(now.value)
  ) {
    return '00:00:00'
  }

  // time between now and startedAt in HH:mm:ss
  return formatTimeDiff(props.event!.startedAt, now.value)
})
</script>

<template>
  <div class="p-8 bg-primary text-primary-foreground flex flex-col gap-2 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-8">
      <div class="flex-grow">
        <ProjectActionInput
          v-model:project="state.project"
          v-model:activity="state.activity"
          v-model:note="state.note"
          placeholder="what are you working on?..."
          size="lg"
          class="w-full bg-primary text-primary-foreground border-none"
        />
      </div>
      <div class="flex flex-row items-center gap-8">
        <TimeDurationInput v-if="state.isRunning" v-model="state.startedAtMinutes" class="w-16 text-center font-medium text-sm border-none bg-primary text-primary-foreground" />
        <time class="text-2xl font-medium tracking-wide w-24">{{ durationLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button @click="handleStartStop" variant="inverted">{{ state.isRunning ? $t('dashboard.controls.stopEvent') : $t('dashboard.controls.startEvent') }}</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>