<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {ref, watch} from "vue";
import {formatMinutes} from "@/lib/timeUtils";
import {parseTimeWithEquation} from "@/lib/parsers";
import {isNull} from "@/lib/utils";

// duration in minutes
const model = defineModel<number>({ required: true })

// duration in minutes
const inputValue = ref(formatMinutes(model.value))

watch(() => model.value, (value) => {
  inputValue.value = formatMinutes(value)
})

function handleChange() {
  const parsed = parseTimeWithEquation(inputValue.value)

  if (isNull(parsed)) {
    inputValue.value = formatMinutes(model.value)
    return
  }

  model.value = parsed
}
</script>

<template>
  <Input v-model="inputValue" @change="handleChange" placeholder="00:00" />
</template>