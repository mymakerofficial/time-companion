<script setup lang="ts">
import { computed } from 'vue'
import {
  absDuration,
  durationSinceStartOfDay,
  durationToTime,
} from '@renderer/lib/neoTime'
import { Temporal } from 'temporal-polyfill'
import DurationInput from '@renderer/components/common/inputs/timeInput/DurationInput.vue'
import type {
  InputProps,
  InputSlots,
} from '@renderer/components/ui/input/Input.vue'

const model = defineModel<Temporal.PlainTime>({ required: true })

const props = defineProps<Omit<InputProps, 'type'>>()

defineSlots<InputSlots>()

const forwardModel = computed<Temporal.Duration>({
  get() {
    return durationSinceStartOfDay(model.value)
  },
  set(value) {
    model.value = durationToTime(absDuration(value))
  },
})
</script>

<template>
  <DurationInput v-bind="props" v-model="forwardModel" mode="time">
    <template #leading>
      <slot name="leading" />
    </template>
    <template #input="inputProps">
      <slot name="input" v-bind="inputProps" />
    </template>
    <template #trailing>
      <slot name="trailing" />
    </template>
  </DurationInput>
</template>
