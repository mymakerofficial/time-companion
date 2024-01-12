<script setup lang="ts">
import {type ReactiveCalendarEventShadow} from "@/model/calendar-event-shadow";
import {vProvideColor} from "@/directives/v-provide-color";
import {Slash, Play} from "lucide-vue-next";

defineProps<{
  shadows: ReactiveCalendarEventShadow[]
}>()

const emit = defineEmits<{
  start: [shadow: ReactiveCalendarEventShadow]
}>()

function handleStart(shadow: ReactiveCalendarEventShadow) {
  emit('start', shadow)
}
</script>

<template>
  <div v-if="shadows.length" class="border-b border-border">
    <div class="flex flex-wrap gap-2 p-8">
      <button
        v-for="(shadow, index) in shadows"
        :key="index"
        @click="handleStart(shadow)"
        v-provide-color="shadow.project.color"
        class="px-8 py-4 min-w-52 rounded-md flex flex-row justify-between items-center gap-4 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium tracking-wide text-start"
      >
        <span class="flex flex-row items-center gap-1 max-w-56">
          <span class="truncate">{{ shadow.project.displayName }}</span>
          <Slash v-if="shadow.activity" class="size-4" />
          <span v-if="shadow.activity" class="truncate">{{ shadow.activity?.displayName }}</span>
        </span>
        <Play class="size-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>