<script setup lang="ts">
import ProjectActionInput from '@renderer/components/common/inputs/projectActionInput/ProjectActionInput.vue'
import { Button } from '@renderer/components/ui/button'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  isDefined,
  isNotDefined,
  isNotNull,
  type Nullable,
} from '@renderer/lib/utils'
import type { ReactiveCalendarEvent } from '@renderer/model/calendarEvent/types'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { ReactiveActivity } from '@renderer/model/activity/types'
import type { StartEventProps } from '@renderer/services/activeEventService'
import { useSettingsStore } from '@renderer/stores/settingsStore'
import { refDebounced, whenever } from '@vueuse/core'

const event = defineModel<Nullable<ReactiveCalendarEvent>>({
  required: false,
  default: null,
})

const emit = defineEmits<{
  start: [partialEvent: StartEventProps]
  stop: []
}>()

const { t } = useI18n()
const settings = useSettingsStore()

const autoStartEventWhenTyping = settings.getValue(
  'autoStartActiveEventWhenTyping',
)

const isRunning = computed(
  () => isDefined(event.value?.startAt) && isNotDefined(event.value?.endAt),
)

const debounceTime = 1000

// TODO make this a composable

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
  },
})
const projectDebounced = refDebounced(project, debounceTime)

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
  },
})
const activityDebounced = refDebounced(activity, debounceTime)

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
  },
})
const noteDebounced = refDebounced(note, debounceTime)

whenever(
  () => isDefined(event.value),
  () => {
    projectPlaceholder.value = null
    activityPlaceholder.value = null
    notePlaceholder.value = ''
  },
)

function handleStart() {
  if (!isRunning.value) {
    emit('start', {
      project: project.value,
      activity: activity.value,
      note: note.value,
    })
  }
}

function handleStop() {
  if (isRunning.value) {
    emit('stop')
  }
}

function handleBackspace() {
  if (!isRunning.value) {
    return
  }
  if (isNotNull(projectDebounced.value)) {
    project.value = projectDebounced.value
  }
  if (isNotNull(activityDebounced.value)) {
    activity.value = activityDebounced.value
  }
  if (isNotNull(noteDebounced.value)) {
    note.value = noteDebounced.value
  }
  handleStop()
}

function handleStartTyping() {
  if (autoStartEventWhenTyping.value) {
    handleStart()
  }
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
      @selected="handleStartTyping"
      @start-typing="handleStartTyping"
      @backspace="handleBackspace"
      focus-when-typing
      :placeholder="$t('dashboard.labels.whatAreYouWorkingOn')"
      size="lg"
      v-slot:trailing
    >
      <Button @click="handleStartStop" size="sm" class="mr-1 px-3 py-1">{{
        buttonLabel
      }}</Button>
    </ProjectActionInput>
  </div>
</template>
