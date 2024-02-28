<script setup lang="ts">
import {ref, watch} from "vue";
import {Input} from "@/components/ui/input";
import {durationToTime, formatDuration, formatTime, withFormat} from "@/lib/neoTime";
import {parseHumanDurationWithEquation} from "@/lib/parsers";
import {cn, isNull} from "@/lib/utils";
import {Temporal} from "temporal-polyfill";
import {watchImmediate} from "@vueuse/core";
import type {InputProps} from "@/components/ui/input/Input.vue";
import {useForwardProps} from "radix-vue";

const model = defineModel<Temporal.Duration>({ required: true })

const props = defineProps<Omit<InputProps, 'type'>>()

const inputValue = ref('')

watchImmediate(model, setInputFromModel)

function setInputFromModel() {
  inputValue.value = formatDuration(model.value)
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
  <Input v-bind="props" v-model="inputValue" @change="handleChange" />
</template>
