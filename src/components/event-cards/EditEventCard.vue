<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {computed, reactive} from "vue";
import type {CalendarEvent} from "@/lib/types";
import TimeDurationInput from "@/components/TimeDurationInput.vue";
import {minutesSinceStartOfDay} from "@/lib/time-utils";
import {isNull} from "@/lib/utils";

const model = defineModel<CalendarEvent>({ required: true })

const emit = defineEmits<{
  continue: [event: CalendarEvent]
}>()

const state = reactive({
  name: computed({
    get() { return model.value.projectDisplayName || '' },
    set(value) { model.value.projectDisplayName = value }
  }),

  startedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(model.value?.startedAt) },
    set() { return }
  }),

  endedAtMinutes: computed({
    get() { return minutesSinceStartOfDay(model.value?.endedAt) },
    set() { return }
  }),

  durationMinutes: computed({
    get() {
      const startedAt = model.value.startedAt
      const endedAt = model.value.endedAt

      if (isNull(startedAt) || isNull(endedAt)) {
        return 0
      }

      return minutesSinceStartOfDay(endedAt) - minutesSinceStartOfDay(startedAt)
    },
    set() { return }
  }),
})

function handleContinue() {
  emit('continue', model.value)
}
</script>

<template>
  <div class="p-8 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <Input v-model="state.name" class="font-medium text-xl" />
      </div>
      <div class="flex flex-row items-center">
        <TimeDurationInput v-model="state.startedAtMinutes" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
        <span class="text-accent">-</span>
        <TimeDurationInput v-model="state.endedAtMinutes" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
      </div>
      <div>
        <TimeDurationInput v-model="state.durationMinutes" placeholder="00:00" class="w-20 text-center font-medium text-xl border-none" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button @click="handleContinue()">Continue</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>