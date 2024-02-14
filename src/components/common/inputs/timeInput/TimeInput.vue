<script setup lang="ts" generic="TValue extends LocalDateTime | LocalTime | Duration">
import {DateTimeFormatter, type Duration, type LocalDateTime, type LocalTime} from "@js-joda/core";
import {ref, watch} from "vue";
import {Input} from "@/components/ui/input";
import {formatDateTime} from "@/lib/neoTime";
import {parseHumanTimeWithEquation} from "@/lib/parsers";
import {isNull} from "@/lib/utils";

const model = defineModel<TValue>({ required: true })

const inputValue = ref('')

watch(() => model.value, () => {
  setInputFromModel()
}, { immediate: true })

function setInputFromModel() {
  inputValue.value = formatDateTime(
    model.value,
    DateTimeFormatter.ofPattern('HH:mm')
  )
}

function handleChange() {
  const parsed = parseHumanTimeWithEquation(inputValue.value) // TODO handle error

  if (isNull(parsed)) {
    setInputFromModel()
    return
  }

  model.value = model.value.with(parsed)
}
</script>

<template>
  <Input v-model="inputValue" @change="handleChange" />
</template>
