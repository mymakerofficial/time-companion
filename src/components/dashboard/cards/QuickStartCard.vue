<script setup lang="ts">
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow/types";
import {vProvideColor} from "@/directives/vProvideColor";
import {PencilLine, Play, Slash} from "lucide-vue-next";
import {useQuickAccess} from "@/composables/useQuickAccess";

const emit = defineEmits<{
  start: [shadow: ReactiveCalendarEventShadow]
}>()

defineProps<{
  iconPencil?: boolean
}>()

const shadows = useQuickAccess()

function handleClick(shadow: ReactiveCalendarEventShadow) {
  emit('start', shadow)
}
</script>

<template>
  <div v-if="shadows.length" class="border-b border-border">
    <div class="flex flex-wrap gap-2 p-8">
      <button
        v-for="(shadow, index) in shadows"
        :key="index"
        @click="handleClick(shadow)"
        v-provide-color="shadow.color"
        class="px-8 py-4 min-w-52 rounded-md flex flex-row justify-between items-center gap-4 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium tracking-wide text-start"
      >
        <span class="flex flex-row items-center gap-1 max-w-56">
          <span class="truncate">{{ shadow.project.displayName }}</span>
          <Slash v-if="shadow.activity" class="size-4" />
          <span v-if="shadow.activity" class="truncate">{{ shadow.activity?.displayName }}</span>
        </span>
        <PencilLine v-if="iconPencil" class="size-4" />
        <Play v-else class="size-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>