<script setup lang="ts">
import ReminderEventCard from "@/components/event-cards/ReminderEventCard.vue";
import {computed} from "vue";
import dayjs from "dayjs";
import {useNow} from "@vueuse/core";
import type {ReactiveCalendarReminder} from "@/model/calendar-reminder";

const props = defineProps<{
  reminders: ReactiveCalendarReminder[]
}>()

const now = useNow()

const filteredReminders = computed(() => {
  return props.reminders.filter((reminder) => {
    if (reminder.isDismissed) {
      return false
    }

    const startAt = dayjs(reminder.remindAt).add(-reminder.remindMinutesBefore, 'minute')
    const endAt = dayjs(reminder.remindAt).add(reminder.remindMinutesAfter, 'minute')

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