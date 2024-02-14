<script setup lang="ts">
import ReminderEventCard from "@/components/dashboard/cards/ReminderEventCard.vue";
import {computed} from "vue";
import type {ReactiveCalendarReminder} from "@/model/calendarReminder";
import {useTimeNow} from "@/composables/useNow";
import {minutes} from "@/lib/neoTime";

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

    const startAt = reminder.startAt.minus(reminder.remindBefore)
    const endAt = reminder.startAt.plus(reminder.remindAfter)

    return now.value.isAfter(startAt) && now.value.isBefore(endAt)
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