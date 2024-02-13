<script setup lang="ts">
import {DateTimeFormatter, type LocalDateTime} from "@js-joda/core";
import {ref, watch} from "vue";
import {Input} from "@/components/ui/input";
import {formatDateTime} from "@/lib/neoTime";
import {parseDurationEquation} from "@/lib/parsers";
import {isNull} from "@/lib/utils";

const model = defineModel<LocalDateTime>({ required: true })

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
  const parsed = parseDurationEquation(inputValue.value) // TODO handle error

  if (isNull(parsed)) {
    setInputFromModel()
    return
  }

  model.value = model.value
    .withHour(parsed.hour())
    .withMinute(parsed.minute())
}
</script>

<template>
  <Input v-model="inputValue" @change="handleChange" />
</template>
