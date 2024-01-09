<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {computed, reactive} from "vue";
import type {CalendarEvent} from "@/lib/types";
import TimeDurationInput from "@/components/TimeDurationInput.vue";
import {minsSinceStartOfDay} from "@/lib/time-utils";

const model = defineModel<CalendarEvent>({ required: true })

const emit = defineEmits<{
  continue: [event: CalendarEvent]
}>()

const state = reactive({
  name: computed({
    get() { return model.value?.projectDisplayName || '' },
    set(value) { model.value!.projectDisplayName = value }
  }),

  startedAtInput: computed({
    get() { return minsSinceStartOfDay(model.value?.startedAt || null) },
    set() { return }
  }),

  endedAtInput: computed({
    get() { return minsSinceStartOfDay(model.value?.endedAt || null) },
    set() { return }
  }),

  timeInput: computed({
    get() {
      const startedAt = model.value?.startedAt || null
      const endedAt = model.value?.endedAt || null

      if (startedAt === null || endedAt === null) {
        return null
      }

      return minsSinceStartOfDay(endedAt) - minsSinceStartOfDay(startedAt)
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
        <TimeDurationInput v-model="state.startedAtInput" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
        <span class="text-accent">-</span>
        <TimeDurationInput v-model="state.endedAtInput" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
      </div>
      <div>
        <TimeDurationInput v-model="state.timeInput" placeholder="00:00" class="w-20 text-center font-medium text-xl border-none" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button @click="handleContinue()">Continue</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>