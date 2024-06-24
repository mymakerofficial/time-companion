<script setup lang="ts">
import { computed, toValue } from 'vue'
import { durationToGridRows } from '@renderer/lib/calendarUtils'
import { vProvideColor } from '@renderer/directives/vProvideColor'
import { formatTime, withFormat } from '@renderer/lib/neoTime'
import { useNow } from '@renderer/composables/useNow'
import type { TimeEntryDto } from '@shared/model/timeEntry'
import { Duration } from '@shared/lib/datetime/duration'
import { isNull } from '@shared/lib/utils/checks'
import { useGetProjectById } from '@renderer/composables/queries/projects/useGetProjectById'
import { useI18n } from 'vue-i18n'

const START_OFFSET = 2 // due to spacing at the top
const MIN_ROW_SPAN = 1 // to prevent too small and negative spans

const props = defineProps<{
  entry: TimeEntryDto
}>()
const emit = defineEmits<{
  click: []
}>()

const { locale } = useI18n()
const now = useNow({ interval: Duration.from({ minutes: 1 }) })
const { data: project } = useGetProjectById(props.entry.projectId)

const containerPosition = computed(() => {
  const { startedAt, stoppedAt } = props.entry

  const startRow =
    durationToGridRows(startedAt.toPlainTime().toDuration()) + START_OFFSET
  const spanRows = Math.max(
    durationToGridRows(startedAt.until(stoppedAt ?? now.value)),
    MIN_ROW_SPAN,
  )

  return { startRow, spanRows }
})

const containerStyle = computed(() => {
  const { startRow, spanRows } = containerPosition.value

  return {
    gridRow: `${startRow} / span ${spanRows}`,
  }
})

const startedAtLabel = computed(() => {
  return props.entry.startedAt.toLocaleString(toValue(locale), {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })
})

const endedAtLabel = computed(() => {
  if (isNull(props.entry.stoppedAt)) {
    return 'now'
  }

  return formatTime(props.entry.stoppedAt, withFormat('HH:mm'))
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
          <div class="font-medium flex items-center gap-1">
            <span>{{ project?.displayName }}</span>
          </div>
          <span>{{ entry.description }}</span>
        </div>
        <span class="text-xs">
          <time>{{ startedAtLabel }}</time>
          <span> - </span>
          <time>{{ endedAtLabel }}</time>
        </span>
      </div>
    </div>
  </div>
</template>
