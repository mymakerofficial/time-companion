<script setup lang="ts">
import {ref} from "vue";
import {Input} from "@/components/ui/input";
import {formatDuration, humanizeDuration} from "@/lib/neoTime";
import {parseHumanDurationWithEquation} from "@/lib/parsers";
import {isNull} from "@/lib/utils";
import {Temporal} from "temporal-polyfill";
import {watchImmediate} from "@vueuse/core";
import type {InputProps, InputSlots} from "@/components/ui/input/Input.vue";

const model = defineModel<Temporal.Duration>({ required: true })

const props = withDefaults(defineProps<Omit<InputProps, 'type'> & {
  mode?: 'duration' | 'time'
}>(), {
  mode: 'duration'
})

defineSlots<InputSlots>()

const inputValue = ref('')

watchImmediate(model, setInputFromModel)

function setInputFromModel() {
  if (props.mode === 'duration') {
    inputValue.value = humanizeDuration(model.value)
  } else {
    inputValue.value = formatDuration(model.value)
  }
}

function handleChange() {
  const parsedDuration = parseHumanDurationWithEquation(inputValue.value)

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
