<script setup lang="ts">
import ProjectActionInput from "@/components/common/inputs/projectActionInput/ProjectActionInput.vue";
import {Button} from "@/components/ui/button";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {isDefined, isNotDefined, isNotNull, type Nullable} from "@/lib/utils";
import type {ReactiveCalendarEvent} from "@/model/calendarEvent/types";
import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveActivity} from "@/model/activity/types";
import type {StartEventProps} from "@/services/activeEventService";

const event = defineModel<Nullable<ReactiveCalendarEvent>>( { required: false, default: null })

const emit = defineEmits<{
  start: [partialEvent: StartEventProps]
  stop: []
}>()

const { t } = useI18n()

const isRunning = computed(() => isDefined(event.value?.startAt) && isNotDefined(event.value?.endAt))

const projectPlaceholder = ref<Nullable<ReactiveProject>>(null)
const project = computed<Nullable<ReactiveProject>>({
  get() {
    if (isNotNull(event.value)) {
      return event.value.project
    } else {
      return projectPlaceholder.value
    }
  },
  set(value) {
    if (isNotNull(event.value)) {
      event.value.project = value
    } else {
      projectPlaceholder.value = value
    }
  }
})

const activityPlaceholder = ref<Nullable<ReactiveActivity>>(null)
const activity = computed<Nullable<ReactiveActivity>>({
  get() {
    if (isNotNull(event.value)) {
      return event.value.activity
    } else {
      return activityPlaceholder.value
    }
  },
  set(value) {
    if (isNotNull(event.value)) {
      event.value.activity = value
    } else {
      activityPlaceholder.value = value
    }
  }
})

const notePlaceholder = ref('')
const note = computed({
  get() {
    if (isNotNull(event.value)) {
      return event.value.note
    } else {
      return notePlaceholder.value
    }
  },
  set(value) {
    if (isNotNull(event.value)) {
      event.value.note = value
    } else {
      notePlaceholder.value = value
    }
  }
})

function handleStart() {
  if (!isRunning.value) {
    emit('start', {
      project: project.value,
      activity: activity.value,
      note: note.value
    })
  }
}

function handleStop() {
  if (isRunning.value) {
    emit('stop')
  }
}

function handleStartTyping() {
  handleStart()
}

function handleStartStop() {
  if (!isRunning.value) {
    handleStart()
  } else {
    handleStop()
  }
}

const buttonLabel = computed(() => {
  if (isRunning.value) {
    return t('dashboard.controls.stopEvent')
  } else {
    return t('dashboard.controls.startEvent')
  }
})
</script>

<template>
  <div class="flex-grow">
    <ProjectActionInput
      v-model:project="project"
      v-model:activity="activity"
      v-model:note="note"
      @start-typing="handleStartTyping"
      focus-when-typing
      placeholder="what are you working on?..."
      size="lg"
      v-slot:trailing
    >
      <Button @click="handleStartStop" size="sm" class="mr-1 px-3 py-1">{{ buttonLabel }}</Button>
    </ProjectActionInput>
  </div>
</template>