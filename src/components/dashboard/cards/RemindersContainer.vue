<script setup lang="ts">
import ReminderEventCard from "@/components/dashboard/cards/ReminderEventCard.vue";
import {computed} from "vue";
import type {ReactiveCalendarReminder} from "@/model/calendarReminder/types";
import {useTimeNow} from "@/composables/useNow";
import {isAfter, isBefore, minutes} from "@/lib/neoTime";

const props = defineProps<{
  reminders: ReactiveCalendarReminder[]
}>()

const now = useTimeNow({
  interval: minutes(1)
})

// TODO move this to a more appropriate place
const filteredReminders = computed(() => {
  return props.reminders.filter((reminder) => {
    if (reminder.isDismissed) {
      return false
    }

    const startAt = reminder.startAt.subtract(reminder.remindBefore)
    const endAt = reminder.startAt.add(reminder.remindAfter)

    return isAfter(now.value, startAt) && isBefore(now.value, endAt)
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