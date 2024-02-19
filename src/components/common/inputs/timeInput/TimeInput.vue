<script setup lang="ts">
import {ref, watch} from "vue";
import {Input} from "@/components/ui/input";
import {formatTime, withFormat} from "@/lib/neoTime";
import {parseHumanTimeWithEquation} from "@/lib/parsers";
import {isNull} from "@/lib/utils";
import {Temporal} from "temporal-polyfill";

const model = defineModel<Temporal.PlainTime>({ required: true })

const inputValue = ref('')

watch(
  () => model.value,
  () => setInputFromModel(),
  { immediate: true }
)

function setInputFromModel() {
  inputValue.value = formatTime(model.value, withFormat('HH:mm'))
}

function handleChange() {
  const parsed = parseHumanTimeWithEquation(inputValue.value)

  if (isNull(parsed)) {
    setInputFromModel()
    return
  }

  model.value = parsed
}
</script>

<template>
  <Input v-model="inputValue" @change="handleChange" />
</template>
