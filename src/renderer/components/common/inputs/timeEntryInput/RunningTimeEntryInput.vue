<script setup lang="ts">
import TimeEntryInput from '@renderer/components/common/inputs/timeEntryInput/TimeEntryInput.vue'
import DateTimeInput from '@renderer/components/common/inputs/timeInput/DateTimeInput.vue'
import { Button } from '@renderer/components/ui/button'
import { useGetRunningTimeEntry } from '@renderer/composables/queries/timeEntries/useGetRunningTimeEntry'
import { useCreateTimeEntry } from '@renderer/composables/mutations/timeEntries/useCreateTimeEntry'
import { computed, ref, watch } from 'vue'
import { isNotNull, isNull } from '@shared/lib/utils/checks'
import { usePatchTimeEntry } from '@renderer/composables/mutations/timeEntries/usePatchTimeEntry'
import { useI18n } from 'vue-i18n'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { Nullable } from '@shared/lib/utils/types'
import { useNow } from '@renderer/composables/useNow'
import { humanizeDuration } from '@renderer/lib/neoTime'
import { Clock } from 'lucide-vue-next'

const props = defineProps<{
  dayId: string
}>()

const { t } = useI18n()
const now = useNow()
const { data: runningEntry } = useGetRunningTimeEntry(props.dayId)
const { mutateAsync: createEntry } = useCreateTimeEntry()
const { mutateAsync: patchEntry } = usePatchTimeEntry()

const projectId = ref<Nullable<string>>(null)
const description = ref('')
const startedAt = ref(PlainDateTime.now())

watch(runningEntry, (entry) => {
  if (isNull(entry)) {
    projectId.value = null
    description.value = ''
    startedAt.value = PlainDateTime.now()
    return
  }
  projectId.value = entry.projectId
  description.value = entry.description
  startedAt.value = entry.startedAt
})

const isRunning = computed(() => isNotNull(runningEntry.value))

const buttonLabel = computed(() => {
  if (isRunning.value) {
    return t('dashboard.controls.stopEvent')
  } else {
    return t('dashboard.controls.startEvent')
  }
})

const duration = computed(() => {
  return startedAt.value.until(now.value)
})

const durationLabel = computed(() => {
  return humanizeDuration(duration.value, {
    includeSeconds: true,
  })
})

async function handleChange() {
  if (isNull(runningEntry.value)) return
  await patchEntry({
    id: runningEntry.value.id,
    timeEntry: {
      projectId: projectId.value,
      description: description.value,
      startedAt: startedAt.value,
    },
  })
}

async function handleStart() {
  await createEntry({
    projectId: projectId.value,
    description: description.value,
    startedAt: PlainDateTime.now(),
    dayId: props.dayId,
  })
}

async function handleStop() {
  if (isNull(runningEntry.value)) return
  await patchEntry({
    id: runningEntry.value.id,
    timeEntry: {
      stoppedAt: PlainDateTime.now(),
    },
  })
}

async function handleToggle() {
  if (isRunning.value) {
    await handleStop()
  } else {
    await handleStart()
  }
}
</script>

<template>
  <TimeEntryInput
    v-model:project-id="projectId"
    v-model:description="description"
    @change="handleChange"
  >
    <template #leading>
      <slot name="leading" />
    </template>
    <template #input-trailing>
      <Button @click="handleToggle" class="h-8 mr-1">{{ buttonLabel }}</Button>
    </template>
    <template #trailing>
      <DateTimeInput
        v-if="isRunning"
        v-model="startedAt"
        @change="handleChange"
        class="w-32"
        input-class="w-12"
      >
        <template #leading>
          <Clock class="mx-3 size-4 text-muted-foreground" />
        </template>
      </DateTimeInput>
      <time
        v-if="isRunning"
        class="text-lg font-medium text-center min-w-24"
        v-text="durationLabel"
      />
      <slot name="trailing" />
    </template>
  </TimeEntryInput>
</template>
