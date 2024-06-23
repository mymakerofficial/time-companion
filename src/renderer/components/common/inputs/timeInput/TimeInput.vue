<script setup lang="ts">
import { computed } from 'vue'
import DurationInput from '@renderer/components/common/inputs/timeInput/DurationInput.vue'
import type {
  InputProps,
  InputSlots,
} from '@renderer/components/ui/input/Input.vue'
import type { PlainTime } from '@shared/lib/datetime/plainTime'
import type { Duration } from '@shared/lib/datetime/duration'

const model = defineModel<PlainTime>({ required: true })
const props = defineProps<
  Omit<InputProps, 'type'> & {
    tooltip?: string
  }
>()
const emit = defineEmits<{
  change: [PlainTime]
}>()
defineSlots<InputSlots>()

const forwardModel = computed<Duration>({
  get() {
    return model.value.toDuration()
  },
  set(value) {
    model.value = value.toPlainTime()
  },
})

function handleChange(value: Duration) {
  emit('change', value.toPlainTime())
}

const tooltip = computed(() => props.tooltip ?? model.value.toString())
</script>

<template>
  <DurationInput
    v-bind="props"
    v-model="forwardModel"
    :tooltip="tooltip"
    mode="time"
    @change="handleChange"
  >
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
