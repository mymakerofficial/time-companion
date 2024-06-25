<script setup lang="ts">
import { isNull } from '@shared/lib/utils/checks'
import { usePatchTimeEntry } from '@renderer/composables/mutations/timeEntries/usePatchTimeEntry'
import { useGetTimeEntry } from '@renderer/composables/queries/timeEntries/useGetTimeEntry'
import { vProvideColor } from '@renderer/directives/vProvideColor'
import { useGetProjectById } from '@renderer/composables/queries/projects/useGetProjectById'
import TimeEntryRealtimeForm from '@renderer/components/common/forms/timeEntry/TimeEntryRealtimeForm.vue'
import type { TimeEntryBase } from '@shared/model/timeEntry'
import { useSoftDeleteTimeEntry } from '@renderer/composables/mutations/timeEntries/useSoftDeleteTimeEntry'

const props = defineProps<{
  id: string
}>()
const { data: timeEntry } = useGetTimeEntry(props.id)
const { mutateAsync: patchEntry } = usePatchTimeEntry()
const { mutateAsync: deleteEntry } = useSoftDeleteTimeEntry()
const { data: project } = useGetProjectById(() => timeEntry.value?.projectId)

async function handleChange(values: TimeEntryBase) {
  if (isNull(timeEntry.value)) return
  await patchEntry({
    id: timeEntry.value.id,
    timeEntry: values,
  })
}
async function handleDelete() {
  if (isNull(timeEntry.value)) return
  await deleteEntry(timeEntry.value.id)
}
</script>

<template>
  <div class="border-b border-border">
    <TimeEntryRealtimeForm
      v-if="timeEntry"
      :time-entry="timeEntry"
      @change="handleChange"
      @delete="handleDelete"
      v-provide-color="project?.color"
      class="p-6 border-l-4 border-color-500"
    />
  </div>
</template>
