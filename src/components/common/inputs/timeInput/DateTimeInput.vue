<script setup lang="ts">
import {Temporal} from "temporal-polyfill";
import {computed} from "vue";
import {dateWithTime} from "@/lib/neoTime";
import TimeInput from "@/components/common/inputs/timeInput/TimeInput.vue";

const model = defineModel<Temporal.PlainDateTime>({ required: true })

const forwardModel = computed<Temporal.PlainTime>({
  get() {
    return model.value.toPlainTime()
  },
  set(value) {
    model.value = dateWithTime(model.value, value)
  }
})
</script>

<template>
  <TimeInput v-model="forwardModel" />
</template>