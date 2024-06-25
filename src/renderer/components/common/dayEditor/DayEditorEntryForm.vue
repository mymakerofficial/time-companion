<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DateTimeInput from '@renderer/components/common/inputs/timeInput/DateTimeInput.vue'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { ArrowRight, Clock } from 'lucide-vue-next'
import { humanizeDuration } from '@renderer/lib/neoTime'
import type { Nullable } from '@shared/lib/utils/types'
import { isNull } from '@shared/lib/utils/checks'
import { usePatchTimeEntry } from '@renderer/composables/mutations/timeEntries/usePatchTimeEntry'
import { useGetTimeEntry } from '@renderer/composables/queries/timeEntries/useGetTimeEntry'
import { vProvideColor } from '@renderer/directives/vProvideColor'
import { useGetProjectById } from '@renderer/composables/queries/projects/useGetProjectById'
import TimeEntryInput from '@renderer/components/common/inputs/timeEntryInput/TimeEntryInput.vue'

const props = defineProps<{
  id: string
}>()
const { data: timeEntry } = useGetTimeEntry(props.id)
const { mutateAsync: patchEntry } = usePatchTimeEntry()

const projectId = ref<Nullable<string>>(null)
const description = ref<string>('')
const startedAt = ref<PlainDateTime>(PlainDateTime.now())
const stoppedAt = ref<Nullable<PlainDateTime>>(null)

const { data: project } = useGetProjectById(projectId)

watch(timeEntry, (entry) => {
  if (isNull(entry)) return
  projectId.value = entry.projectId
  description.value = entry.description
  startedAt.value = entry.startedAt
  stoppedAt.value = entry.stoppedAt
})

const duration = computed(() => {
  return stoppedAt.value ? startedAt.value.until(stoppedAt.value) : null
})

const durationLabel = computed(() => {
  return duration.value ? humanizeDuration(duration.value) : null
})

async function handleChange() {
  if (isNull(timeEntry.value)) return
  await patchEntry({
    id: timeEntry.value.id,
    timeEntry: {
      projectId: projectId.value,
      description: description.value,
      startedAt: startedAt.value,
      stoppedAt: stoppedAt.value,
    },
  })
}
</script>

<template>
  <div class="border-b border-border">
    <div
      v-provide-color="project?.color"
      class="p-6 flex flex-col gap-4 border-l-4 border-color-500"
    >
      <TimeEntryInput
        v-model:project-id="projectId"
        v-model:description="description"
        @change="handleChange"
      />
      <div class="flex flex-row items-center gap-2">
        <DateTimeInput
          v-model="startedAt"
          @change="handleChange"
          class="flex-1"
          input-class="w-12"
        >
          <template #leading>
            <Clock class="mx-3 size-4 text-muted-foreground" />
          </template>
        </DateTimeInput>
        <DateTimeInput
          v-if="stoppedAt"
          v-model="stoppedAt"
          @change="handleChange"
          class="flex-1"
          input-class="w-12"
        >
          <template #leading>
            <ArrowRight class="mx-3 size-4 text-muted-foreground" />
          </template>
          <template #trailing>
            <span
              class="ml-auto mr-3 text-sm text-neutral-500"
              v-text="durationLabel"
            />
          </template>
        </DateTimeInput>
      </div>
    </div>
  </div>
</template>
