<script setup lang="ts" generic="TValue extends Temporal.PlainDateTime | Temporal.PlainTime">
import {ref, watch} from "vue";
import {Input} from "@/components/ui/input";
import {formatTime, withFormat} from "@/lib/neoTime";
import {parseHumanTimeWithEquation} from "@/lib/parsers";
import {isNull} from "@/lib/utils";
import {Temporal} from "temporal-polyfill";

const model = defineModel<TValue>({ required: true })

const inputValue = ref('')

watch(() => model.value, () => {
  setInputFromModel()
}, { immediate: true })

function setInputFromModel() {
  inputValue.value = formatTime(model.value, withFormat('HH:mm'))
}

function handleChange() {
  const parsed = parseHumanTimeWithEquation(inputValue.value) // TODO handle error

  if (isNull(parsed)) {
    setInputFromModel()
    return
  }

  model.value = model.value.with(parsed) as TValue
}
</script>

<template>
  <Input v-model="inputValue" @change="handleChange" />
</template>
