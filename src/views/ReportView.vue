<script setup lang="ts">
import DayReportCard from "@/components/event-cards/DayReportCard.vue";
import {useCalendarStore} from "@/stores/calendar-store";
import CalendarHeader from "@/components/CalendarHeader.vue";
import {AlertCircle} from "lucide-vue-next";

const calendarStore = useCalendarStore()
</script>

<template>
  <main class="w-screen">
    <CalendarHeader />
    <DayReportCard
      v-if="calendarStore.activeDay.day"
      :report="calendarStore.activeDay.day.timeReport"
      class="border-b border-border"
    />
    <div v-else class="m-4 text-red-500 flex items-center gap-2"><AlertCircle class="size-5" />Calendar is not initialized</div>
  </main>
</template>