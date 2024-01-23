<script setup lang="ts">
import {Toggle} from "@/components/ui/toggle";
import {weekDayNames} from "./constants";
import type {RepeatOnWeekdays} from "@/model/calendarReminder";

const model = defineModel<RepeatOnWeekdays>({ required: true })
</script>

<template>
  <div class="flex flex-row gap-2">
    <Toggle
      v-for="key in Object.keys(model)"
      :key="`${key}${model[key]}`"
      v-model:pressed="model[key]"
      v-text="weekDayNames[key]"
    />
  </div>
</template>