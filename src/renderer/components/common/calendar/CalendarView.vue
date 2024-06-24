<script setup lang="ts">
import CalendarViewEntry from '@renderer/components/common/calendar/CalendarViewEntry.vue'
import CalendarViewPointer from '@renderer/components/common/calendar/CalendarViewPointer.vue'
import type { TimeEntryDto } from '@shared/model/timeEntry'
import { useI18n } from 'vue-i18n'
import { rowsToTime } from '@renderer/components/common/calendar/calendarUtils'

defineProps<{
  entries: Array<TimeEntryDto>
}>()
const emit = defineEmits<{
  selected: [event: TimeEntryDto]
}>()

const { locale } = useI18n()

function getRowTimeLabel(row: number) {
  return rowsToTime(row).toLocaleString(locale.value, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })
}

function handleClick(entry: TimeEntryDto) {
  emit('selected', entry)
}
</script>

<template>
  <div class="flex-1 flex overflow-y-scroll">
    <div class="flex w-full min-h-[148rem]">
      <div class="w-20 border-r border-border" />
      <div class="flex-1 grid grid-cols-1 grid-rows-1">
        <div
          class="col-start-1 col-end-2 row-end-2 -ml-3 grid grid-rows-[2em_repeat(48,_minmax(0,_1fr))]"
        >
          <div />
          <template v-for="i in 48">
            <div class="border-t border-border">
              <div
                v-if="i % 2 === 1"
                class="leading-5 text-right -ml-24 -mt-2.5 pr-5 w-24"
              >
                <time
                  class="text-xs font-medium text-muted-foreground select-none"
                  v-text="getRowTimeLabel(i - 1)"
                />
              </div>
            </div>
          </template>
        </div>
        <div
          class="relative col-start-1 col-end-2 row-end-2 mr-3 border-r border-border grid grid-rows-[2rem_repeat(288,_minmax(0,_1fr))_auto] grid-cols-1"
        >
          <CalendarViewEntry
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
            @click="handleClick(entry)"
          />
          <CalendarViewPointer />
        </div>
      </div>
    </div>
  </div>
</template>
