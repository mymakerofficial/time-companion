<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@shadcn/sheet'
import DayCalendar from '@renderer/components/common/calendar/DayCalendar.vue'
import { useDialogContext } from '@renderer/composables/dialog/useDialog'
import { useGetTimeEntriesByDay } from '@renderer/composables/queries/timeEntries/useTimeEntriesByDay'
import DayEditorEntryForm from '@renderer/components/common/dayEditor/DayEditorEntryForm.vue'
import { useGetDay } from '@renderer/composables/queries/days/useGetDay'
import { useFormattedDateTime } from '@renderer/composables/datetime/useFormattedDateTime'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shadcn/resizable'

const props = defineProps<{
  dayId: string
}>()

const { open } = useDialogContext()
const { data: day } = useGetDay(props.dayId)
const { data: timeEntries } = useGetTimeEntriesByDay(props.dayId)
const dayLabel = useFormattedDateTime(() => day.value?.date, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="sm:w-3/5 p-0">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel collapsible :min-size="24" class="flex-1 flex">
          <DayCalendar :day-id="dayId" />
        </ResizablePanel>
        <ResizableHandle with-handle :tabindex="-1" />
        <ResizablePanel collapsible :min-size="36" class="flex-1 flex flex-col">
          <SheetHeader class="p-6 border-b border-border">
            <SheetTitle>{{ dayLabel }}</SheetTitle>
            <SheetDescription>
              Edit the time entries for the selected day.
            </SheetDescription>
          </SheetHeader>
          <DayEditorEntryForm
            v-for="timeEntry in timeEntries"
            :key="timeEntry.id"
            :id="timeEntry.id"
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </SheetContent>
  </Sheet>
</template>
