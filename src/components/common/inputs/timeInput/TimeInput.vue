<script setup lang="ts">
import {ref, watch} from "vue";
import {Input} from "@/components/ui/input";
import {durationToTime, formatTime, withFormat} from "@/lib/neoTime";
import {parseHumanDurationWithEquation} from "@/lib/parsers";
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
  const parsedDuration = parseHumanDurationWithEquation(inputValue.value)

  if (isNull(parsedDuration)) {
    setInputFromModel()
    return
  }

  model.value = durationToTime(parsedDuration)
}
</script>

<template>
  <Input v-model="inputValue" @change="handleChange" />
</template>
