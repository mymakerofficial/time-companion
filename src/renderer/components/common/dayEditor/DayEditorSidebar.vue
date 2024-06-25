<script setup lang="ts">
import { Sheet, SheetContent } from '@shadcn/sheet'
import DayCalendar from '@renderer/components/common/calendar/DayCalendar.vue'
import { useDialogContext } from '@renderer/composables/dialog/useDialog'
import { useGetTimeEntriesByDay } from '@renderer/composables/queries/timeEntries/useTimeEntriesByDay'
import { useArrayFilter } from '@vueuse/core'
import { isNotNull } from '@shared/lib/utils/checks'
import DayEditorEntryForm from '@renderer/components/common/dayEditor/DayEditorEntryForm.vue'

const props = defineProps<{
  dayId: string
}>()

const { open } = useDialogContext()
const { data: timeEntries } = useGetTimeEntriesByDay(props.dayId)
const filteredTimeEntries = useArrayFilter(timeEntries, (timeEntry) =>
  isNotNull(timeEntry.stoppedAt),
)
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="sm:w-3/5 p-0">
      <div class="flex flex-row h-full">
        <div class="flex-1 flex border-r border-border">
          <DayCalendar :day-id="dayId" />
        </div>
        <div class="flex-1 flex flex-col mt-16 border-t border-border">
          <DayEditorEntryForm
            v-for="timeEntry in filteredTimeEntries"
            :key="timeEntry.id"
            :id="timeEntry.id"
          />
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
