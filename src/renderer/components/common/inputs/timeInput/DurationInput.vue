<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@renderer/components/ui/input'
import { formatDuration, humanizeDuration } from '@renderer/lib/neoTime'
import { parseHumanDurationWithEquation } from '@renderer/lib/parsers'
import { isNull } from '@renderer/lib/utils'
import { Temporal } from 'temporal-polyfill'
import { watchImmediate } from '@vueuse/core'
import type {
  InputProps,
  InputSlots,
} from '@renderer/components/ui/input/Input.vue'

const model = defineModel<Temporal.Duration>({ required: true })

const props = withDefaults(
  defineProps<
    Omit<InputProps, 'type'> & {
      mode?: 'duration' | 'time'
      allowSeconds?: boolean
    }
  >(),
  {
    mode: 'duration',
  },
)

defineSlots<InputSlots>()

const inputValue = ref('')

watchImmediate(model, setInputFromModel)

function setInputFromModel() {
  if (props.mode === 'duration') {
    inputValue.value = humanizeDuration(model.value, {
      includeSeconds: props.allowSeconds,
    })
  } else {
    inputValue.value = formatDuration(model.value)
  }
}

function handleChange() {
  const parsedDuration = parseHumanDurationWithEquation(inputValue.value)

  // TODO forbid seconds if not allowed

  if (isNull(parsedDuration)) {
    setInputFromModel()
    return
  }

  model.value = parsedDuration
}
</script>

<template>
  <Input v-bind="props" v-model="inputValue" @change="handleChange">
    <template #leading>
      <slot name="leading" />
    </template>
    <template #input="inputProps">
      <slot name="input" v-bind="inputProps" />
    </template>
    <template #trailing>
      <slot name="trailing" />
    </template>
  </Input>
</template>
