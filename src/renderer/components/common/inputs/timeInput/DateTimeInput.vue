<script setup lang="ts">
import { computed } from 'vue'
import TimeInput from '@renderer/components/common/inputs/timeInput/TimeInput.vue'
import type {
  InputProps,
  InputSlots,
} from '@renderer/components/ui/input/Input.vue'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { PlainTime } from '@shared/lib/datetime/plainTime'

const model = defineModel<PlainDateTime>({ required: true })
const props = defineProps<
  Omit<InputProps, 'type'> & {
    tooltip?: string
  }
>()
defineSlots<InputSlots>()

const forwardModel = computed<PlainTime>({
  get() {
    return model.value.toPlainTime()
  },
  set(value) {
    model.value = value.toPlainDateTime(model.value)
  },
})

const tooltip = computed(() => props.tooltip ?? model.value.toString())
</script>

<template>
  <TimeInput v-bind="props" v-model="forwardModel" :tooltip="tooltip">
    <template #leading>
      <slot name="leading" />
    </template>
    <template #input="inputProps">
      <slot name="input" v-bind="inputProps" />
    </template>
    <template #trailing>
      <slot name="trailing" />
    </template>
  </TimeInput>
</template>
