<script setup lang="ts">
import ReminderEventCard from "@/components/dashboard/cards/ReminderEventCard.vue";
import {computed} from "vue";
import type {ReactiveCalendarReminder} from "@/model/calendarReminder/types";
import {useTimeNow} from "@/composables/useNow";
import {minutes, timeIsAfter, timeIsBefore} from "@/lib/neoTime";
import type {MaybeReadonly} from "@/lib/utils";
import DashboardSection from "@/components/dashboard/cards/DashboardSection.vue";
import {isNotEmpty} from "@/lib/listUtils";

const props = defineProps<{
  reminders: MaybeReadonly<Array<ReactiveCalendarReminder>>
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

    return timeIsAfter(now.value, startAt) && timeIsBefore(now.value, endAt)
  })
})
</script>

<template>
  <DashboardSection v-if="isNotEmpty(filteredReminders)" label="Upcoming reminders">
    <div class="flex flex-col gap-2">
      <ReminderEventCard
        v-for="reminder in filteredReminders"
        :key="reminder.id"
        :reminder="reminder"
      />
    </div>
  </DashboardSection>
</template>