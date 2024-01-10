<script setup lang="ts">
import type {CalendarReminder} from "@/lib/types";
import ReminderEventCard from "@/components/event-cards/ReminderEventCard.vue";
import {computed} from "vue";
import dayjs from "dayjs";
import {useNow} from "@vueuse/core";

const props = defineProps<{
  reminders: CalendarReminder[]
}>()

const now = useNow()

const filteredReminders = computed(() => {
  return props.reminders.filter((reminder) => {
    if (reminder.isDismissed) {
      return false
    }

    const startAt = dayjs(reminder.remindAt).add(-reminder.remindBeforeMinutes, 'minute')
    const endAt = dayjs(reminder.remindAt).add(reminder.remindAfterMinutes, 'minute')

    return dayjs(now.value).isAfter(startAt) && dayjs(now.value).isBefore(endAt)
  })
})
</script>

<template>
  <ReminderEventCard
    v-for="reminder in filteredReminders"
    :key="reminder.id"
    :reminder="reminder"
  />
</template>