<script setup lang="ts">
import {computed} from "vue";
import {useNow} from "@vueuse/core";
import {formatDate} from "@/lib/timeUtils";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-vue-next";
import dayjs from "dayjs";
import {useCalendarStore} from "@/stores/calendarStore";

// const calendarStore = useCalendarStore()
//
// const now = useNow({ interval: 1000 }) // update every second
//
// const displayDateLabel = computed(() => {
//   return formatDate(calendarStore.activeDay.day?.date, 'dddd, MMMM D')
// })
//
// const displayTimeLabel = computed(() => {
//   return formatDate(now.value)
// })
//
// const hasYesterday = computed(() => {
//   // TODO this doesnt work if the last day is not yesterday
//   return calendarStore.days.some((it) =>
//     dayjs(it.date)
//       .isSame(dayjs(calendarStore.activeDay.day?.date)
//       .startOf('day')
//       .add(-1, 'day'), 'day')
//   )
// })
//
// const hasTomorrow = computed(() => {
//   return calendarStore.days.some((it) =>
//     dayjs(it.date)
//       .isSame(dayjs(calendarStore.activeDay.day?.date)
//       .startOf('day')
//       .add(1, 'day'), 'day')
//   )
// })
//
// const showDaySwitcher = computed(() => {
//   return calendarStore.days.length > 1
// })
//
// function moveActiveDay(offset: number) {
//   calendarStore.setActiveDay(dayjs(calendarStore.activeDay.day?.date).startOf('day').add(offset, 'day').toDate())
// }
</script>

<template>
<!--  <div class="h-16 px-8 border-b border-border flex flex-row justify-between items-center gap-8">-->
<!--    <div class="flex flex-row gap-2 items-center">-->
<!--      <Button v-if="showDaySwitcher" size="icon" variant="ghost" :disabled="!hasYesterday" @click="moveActiveDay(-1)"><ChevronLeft class="size-5" /></Button>-->
<!--      <h3 class="text-md font-medium tracking-wide">{{ displayDateLabel }}</h3>-->
<!--      <Button v-if="showDaySwitcher" size="icon" variant="ghost" :disabled="!hasTomorrow" @click="moveActiveDay(1)"><ChevronRight class="size-5" /></Button>-->
<!--    </div>-->
<!--    <time class="text-md font-medium tracking-wide">{{ displayTimeLabel }}</time>-->
<!--  </div>-->
</template>