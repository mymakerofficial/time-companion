<script setup lang="ts">
import { vProvideColor } from '@renderer/directives/vProvideColor'
import type { TimeEntryDto } from '@shared/model/timeEntry'
import { useGetProjectById } from '@renderer/composables/queries/projects/useGetProjectById'
import { useFormattedDateTime } from '@renderer/composables/datetime/useFormattedDateTime'
import { useCalendarViewEntry } from '@renderer/components/common/calendar/useCalendarView'

const props = defineProps<{
  entry: TimeEntryDto
}>()
const emit = defineEmits<{
  click: []
}>()

const { data: project } = useGetProjectById(() => props.entry.projectId)
const { containerStyle } = useCalendarViewEntry(props.entry)
const startedAtLabel = useFormattedDateTime(props.entry.startedAt, {
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
})
const stoppedAtLabel = useFormattedDateTime(props.entry.stoppedAt, {
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
  fallback: 'now',
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <div class="flex relative mt-0.5 col-span-full" :style="containerStyle">
    <div
      @click="handleClick"
      v-provide-color="project?.color"
      class="cursor-pointer absolute inset-0.5 flex rounded-md overflow-hidden bg-background min-h-3"
    >
      <div
        class="flex-1 px-2 py-1 flex flex-col gap-1 bg-color text-color-foreground hover:bg-color/90"
      >
        <div class="text-sm flex items-center gap-2 text-nowrap">
          <span v-if="project" class="font-medium">
            {{ project?.displayName }}
          </span>
          <span>{{ entry.description }}</span>
        </div>
        <span class="text-xs">
          <time>{{ startedAtLabel }}</time>
          <span> - </span>
          <time>{{ stoppedAtLabel }}</time>
        </span>
      </div>
    </div>
  </div>
</template>
