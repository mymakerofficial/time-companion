<script setup lang="ts">
import type {ReactiveCalendarEventShadow} from "@renderer/model/eventShadow/types";
import {vProvideColor} from "@renderer/directives/vProvideColor";
import {PencilLine, Play} from "lucide-vue-next";
import {useQuickAccess} from "@renderer/composables/useQuickAccess";
import ShadowBadge from "@renderer/components/common/shadow/ShadowBadge.vue";
import {useActiveEventService} from "@renderer/services/activeEventService";
import {computed} from "vue";
import DashboardSection from "@renderer/components/dashboard/cards/DashboardSection.vue";

const emit = defineEmits<{
  start: [shadow: ReactiveCalendarEventShadow]
}>()

defineProps<{
  iconPencil?: boolean
}>()

const activeEventService = useActiveEventService()
const activeEventShadow = computed(() => activeEventService.event?.createShadow() ?? null)

const shadows = useQuickAccess(() => ({
  exclude: activeEventShadow.value,
}))

function handleClick(shadow: ReactiveCalendarEventShadow) {
  emit('start', shadow)
}
</script>

<template>
  <DashboardSection v-if="shadows.length" label="Quick start">
    <div class="flex flex-wrap gap-2 max-w-4xl">
      <button
        v-for="(shadow, index) in shadows"
        :key="index"
        @click="handleClick(shadow)"
        v-provide-color="shadow.color"
        class="px-5 py-3 min-w-44 rounded-md flex flex-row justify-between items-center gap-4 bg-color hover:bg-color/90 text-color-foreground text-md font-medium tracking-wide text-start"
      >
        <ShadowBadge :shadow="shadow" variant="skeleton" size="md" />
        <PencilLine v-if="iconPencil" class="size-4" />
        <Play v-else class="size-4" />
      </button>
    </div>
  </DashboardSection>
</template>