<script setup lang="ts">
import {Temporal} from "temporal-polyfill";
import {computed} from "vue";
import {dateWithTime, toPlainTime} from "@/lib/neoTime";
import TimeInput from "@/components/common/inputs/timeInput/TimeInput.vue";
import type {InputProps} from "@/components/ui/input/Input.vue";

const model = defineModel<Temporal.PlainDateTime>({ required: true })

const props = defineProps<Omit<InputProps, 'type'>>()

const forwardModel = computed<Temporal.PlainTime>({
  get() {
    return toPlainTime(model.value)
  },
  set(value) {
    model.value = dateWithTime(model.value, value)
  }
})
</script>

<template>
  <TimeInput v-bind="props" v-model="forwardModel"  />
</template>