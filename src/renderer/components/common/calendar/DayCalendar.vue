<script setup lang="ts">
import { useGetTimeEntriesByDay } from '@renderer/composables/queries/timeEntries/useTimeEntriesByDay'
import CalendarView from '@renderer/components/common/calendar/CalendarView.vue'

const props = defineProps<{
  dayId: string
}>()

const { data: timeEntries, isPending } = useGetTimeEntriesByDay(props.dayId)
</script>

<template>
  <CalendarView v-if="!isPending" :entries="timeEntries" />
</template>
