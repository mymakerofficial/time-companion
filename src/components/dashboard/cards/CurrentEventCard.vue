<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {computed, reactive, watch} from "vue";
import {watchDebounced} from "@vueuse/core";
import {isNotNull, isNull, type Nullable, runIf} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveActivity} from "@/model/activity/types";
import ProjectActionInput from "@/components/common/inputs/projectActionInput/ProjectActionInput.vue";
import {useNow} from "@/composables/useNow";
import {dateTimeZero, durationBetween, durationZero, humanizeDuration} from "@/lib/neoTime";
import DateTimeInput from "@/components/common/inputs/timeInput/DateTimeInput.vue";
import DashboardSection from "@/components/dashboard/cards/DashboardSection.vue";
import {Clock} from "lucide-vue-next";

const props = defineProps<{
  event: Nullable<ReactiveCalendarEvent>
}>()

const emit = defineEmits<{
  startEvent: []
  stopEvent: []
}>()

const now = useNow()

const state = reactive({
  project: props.event?.project ?? null as Nullable<ReactiveProject>,
  activity: props.event?.activity ?? null as Nullable<ReactiveActivity>,
  note: props.event?.note ?? '',

  startAt: computed<ReactiveCalendarEvent['startAt']>({
    get() { return props.event?.startAt ?? dateTimeZero() },
    set(value) { runIf(props.event, isNotNull, () => props.event!.startAt = value) }
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

const duration = computed(() => {
  if (isNull(props.event)) {
    return durationZero()
  }

  return durationBetween(props.event.startAt, now.value)
})

const durationLabel = computed(() => {
  return humanizeDuration(duration.value, {
    includeSeconds: true,
  })
})
</script>

<template>
  <DashboardSection>
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <ProjectActionInput
          v-model:project="state.project"
          v-model:activity="state.activity"
          v-model:note="state.note"
          placeholder="what are you working on?..."
          size="lg"
          class="w-full"
          v-slot:trailing
        >
          <Button @click="handleStartStop" size="sm" class="mr-1 px-3 py-1">{{ state.isRunning ? $t('dashboard.controls.stopEvent') : $t('dashboard.controls.startEvent') }}</Button>
        </ProjectActionInput>
      </div>
      <div v-if="state.isRunning" class="flex items-center gap-4">
        <DateTimeInput v-if="state.startAt" v-model="state.startAt" placeholder="00:00" size="sm" class="border-none h-11 w-fit text-sm" input-class="w-12" v-slot:leading>
          <Clock class="mx-3 size-4 text-muted-foreground" />
        </DateTimeInput>
        <time class="text-lg font-medium text-center min-w-24">{{ durationLabel }}</time>
      </div>
    </div>
  </DashboardSection>
</template>