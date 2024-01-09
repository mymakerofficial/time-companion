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
    const startAt = dayjs(reminder.remindAt).add(-reminder.remindBeforeMins, 'minute')
    const endAt = dayjs(reminder.remindAt).add(reminder.remindAfterMins, 'minute')

    return dayjs(now.value).isAfter(startAt) && dayjs(now.value).isBefore(endAt)
  })
})
</script>

<template>
  <ReminderEventCard
    v-for="reminder in filteredReminders"
    :display-name="reminder.displayName"
    :remind-at="reminder.remindAt"
    :button-label="reminder.buttonLabel"
    :color="reminder.color"
  />
</template>