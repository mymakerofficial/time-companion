<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@shadcn/input'
import { formatDuration, humanizeDuration } from '@renderer/lib/neoTime'
import { isNull } from '@renderer/lib/utils'
import { watchImmediate } from '@vueuse/core'
import type { InputProps, InputSlots } from '@shadcn/input/Input.vue'
import type { Duration } from '@shared/lib/datetime/duration'
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/tooltip'
import { parseHumanDurationWithEquation } from '@shared/lib/datetime/parsers'

const model = defineModel<Duration>({ required: true })
const props = withDefaults(
  defineProps<
    Omit<InputProps, 'type'> & {
      mode?: 'duration' | 'time'
      allowSeconds?: boolean
      tooltip?: string
    }
  >(),
  {
    mode: 'duration',
  },
)
const emit = defineEmits<{
  change: [Duration]
}>()
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
  emit('change', parsedDuration)
}

const tooltip = computed(() => props.tooltip ?? model.value.toString())
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
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
    </TooltipTrigger>
    <TooltipContent>{{ tooltip }}</TooltipContent>
  </Tooltip>
</template>
