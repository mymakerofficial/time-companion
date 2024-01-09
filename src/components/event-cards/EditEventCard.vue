<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {reactive} from "vue";
import type {CalendarEvent} from "@/lib/types";
import TimeDurationInput from "@/components/TimeDurationInput.vue";
import {minsSinceStartOfDay} from "@/lib/time-utils";

const model = defineModel<CalendarEvent | null>({ required: true })

const emit = defineEmits<{
  continue: [id: string]
}>()

const state = reactive({
  name: model.value?.projectDisplayName || '',
  startedAtInput: minsSinceStartOfDay(model.value?.startedAt || null),
  endedAtInput: minsSinceStartOfDay(model.value?.endedAt || null),
  timeInput: 0,
})
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
        <Button>Continue</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>